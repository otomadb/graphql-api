import { Tag, Video, VideoTag, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { AddTagToVideoFailedMessage, MutationResolvers } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { TagDTO } from "./dto.js";

export const addTagToVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  videotagId: string
) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    await updateWholeVideoTags({ prisma, tx }, videotagId);
    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};

export const add = async (
  prisma: ResolverDeps["prisma"],
  { authUserId: userId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"EXISTS_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  const exists = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (exists && !exists.isRemoved) return err("EXISTS_TAGGING");

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

    return ok(tagging);
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

    return ok(tagging);
  }
};

export const resolverAddTagToVideo = ({ neo4j, prisma, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { currentUser: user }, info) => {
    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.InvalidVideoId,
      };

    const tagId = parseGqlID2("Tag", tagGqlId);
    if (isErr(tagId))
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.InvalidTagId,
      };

    const result = await add(prisma, {
      authUserId: user.id,
      videoId: videoId.data,
      tagId: tagId.data,
    });
    if (isErr(result)) {
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
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "AddTagToVideoSucceededPayload",

      video: new VideoDTO(tagging.video),
      tag: new TagDTO(tagging.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
