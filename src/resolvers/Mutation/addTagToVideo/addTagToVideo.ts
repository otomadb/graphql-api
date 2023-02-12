import { Tag, UserRole, Video, VideoTag, VideoTagEventType } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { ulid } from "ulid";

import { Result } from "../../../utils/Result.js";
import { AddTagToVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";

export const addTagToVideoInNeo4j = async (
  neo4jDriver: Neo4jDriver,
  { videoId, tagId }: { videoId: string; tagId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MERGE (v:Video {id: $video_id})
      MERGE (t:Tag {id: $tag_id})
      MERGE r=(v)-[:TAGGED_BY]->(t)
      RETURN r
    `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const add = async (
  prisma: ResolverDeps["prisma"],
  { authUserId: userId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"EXISTS_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  const exists = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (exists && !exists.isRemoved) return { status: "error", error: "EXISTS_TAGGING" };

  if (exists) {
    // reattach
    const [tagging] = await prisma.$transaction([
      prisma.videoTag.update({
        where: { id: exists.id },
        data: { isRemoved: false },
        include: { video: true, tag: true },
      }),
      prisma.videoTagEvent.create({
        data: {
          userId,
          videoTagId: exists.id,
          type: VideoTagEventType.REATTACHED,
          payload: {},
        },
      }),
    ]);

    return {
      status: "ok",
      data: tagging,
    };
  } else {
    // attach
    const id = ulid();
    const [tagging] = await prisma.$transaction([
      prisma.videoTag.create({
        data: { id, tagId, videoId, isRemoved: false },
        include: { video: true, tag: true },
      }),
      prisma.videoTagEvent.create({
        data: {
          userId,
          videoTagId: id,
          type: VideoTagEventType.REATTACHED,
          payload: {},
        },
      }),
    ]);

    return { status: "ok", data: tagging };
  }
};

export const addTagToVideo = ({ neo4j, prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.InvalidVideoId,
      };

    const tagId = parseGqlID2("Tag", tagGqlId);
    if (tagId.status === "error")
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.InvalidTagId,
      };

    const result = await add(prisma, {
      authUserId: user.id,
      videoId: videoId.data,
      tagId: tagId.data,
    });
    if (result.status === "error") {
      switch (result.error) {
        case "EXISTS_TAGGING":
          return {
            __typename: "AddTagToVideoFailedPayload",
            message: AddTagToVideoFailedMessage.VideoAlreadyTagged,
          };
      }
    }

    const tagging = result.data;
    await addTagToVideoInNeo4j(neo4j, {
      tagId: tagging.tagId,
      videoId: tagging.videoId,
    });

    return {
      __typename: "AddTagToVideoSuccessedPayload",

      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
