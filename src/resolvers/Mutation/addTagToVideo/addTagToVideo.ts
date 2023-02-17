import { Tag, UserRole, Video, VideoTag, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { Result } from "../../../utils/Result.js";
import { AddTagToVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";
import { addTagToVideoInNeo4j } from "./neo4j.js";

export const add = async (
  prisma: ResolverDeps["prisma"],
  { authUserId: userId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"EXISTS_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  const exists = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (exists && !exists.isRemoved) return { status: "error", error: "EXISTS_TAGGING" };

  if (exists) {
    // reattach
    const tagging = await prisma.videoTag.update({
      where: { id: exists.id },
      data: {
        isRemoved: false,
        events: {
          create: {
            userId,
            type: VideoTagEventType.REATTACH,
            payload: {},
          },
        },
      },
      include: { video: true, tag: true },
    });

    return {
      status: "ok",
      data: tagging,
    };
  } else {
    // attach
    const id = ulid();
    const tagging = await prisma.videoTag.create({
      data: {
        id,
        tagId,
        videoId,
        isRemoved: false,
        events: {
          create: {
            userId,
            type: VideoTagEventType.ATTACH,
            payload: {},
          },
        },
      },
      include: { video: true, tag: true },
    });

    return { status: "ok", data: tagging };
  }
};

export const addTagToVideo = ({ neo4j, prisma, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }, info) => {
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

    const neo4jResult = await addTagToVideoInNeo4j({ prisma, neo4j }, tagging.id);
    if (neo4jResult.status === "error") {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "AddTagToVideoSucceededPayload",

      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
