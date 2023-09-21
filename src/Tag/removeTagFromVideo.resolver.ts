import { Tag, Video, VideoTag, VideoTagEventType } from "@prisma/client";

import { MutationResolvers, RemoveTagFromVideoFailedMessage } from "../resolvers/graphql.js";
import { parseGqlID2 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { TagDTO } from "./dto.js";

export const removeInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  videotagId: string,
): Promise<Result<unknown, true>> => {
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

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { authUserId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string },
): Promise<Result<"NO_VIDEO" | "NO_TAG" | "NO_TAGGING" | "REMOVED_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  if ((await prisma.video.findUnique({ where: { id: videoId } })) === null) return err("NO_VIDEO");
  if ((await prisma.tag.findUnique({ where: { id: tagId } })) === null) return err("NO_TAG");

  const extTagging = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (extTagging === null) return err("NO_TAGGING");
  if (extTagging.isRemoved) return err("REMOVED_TAGGING");

  const tagging = await prisma.videoTag.update({
    where: { id: extTagging.id },
    data: {
      isRemoved: true,
      events: {
        create: {
          userId: authUserId,
          type: VideoTagEventType.DETACH,
          payload: {},
        },
      },
    },
    include: { tag: true, video: true },
  });
  return ok(tagging);
};

export const resolverRemoveTagFromVideo = ({
  prisma,
  neo4j,
  logger,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { currentUser: user }, info) => {
    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.InvalidVideoId,
      };

    const tagId = parseGqlID2("Tag", tagGqlId);
    if (isErr(tagId))
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.InvalidTagId,
      };

    const result = await remove(prisma, {
      videoId: videoId.data,
      tagId: tagId.data,
      authUserId: user.id,
    });
    if (isErr(result)) {
      switch (result.error) {
        case "NO_VIDEO":
          return {
            __typename: "RemoveTagFromVideoFailedPayload",
            message: RemoveTagFromVideoFailedMessage.VideoNotFound,
          };
        case "NO_TAG":
          return {
            __typename: "RemoveTagFromVideoFailedPayload",
            message: RemoveTagFromVideoFailedMessage.TagNotFound,
          };
        case "NO_TAGGING":
          return {
            __typename: "RemoveTagFromVideoFailedPayload",
            message: RemoveTagFromVideoFailedMessage.NoTagging,
          };
        case "REMOVED_TAGGING":
          return {
            __typename: "RemoveTagFromVideoFailedPayload",
            message: RemoveTagFromVideoFailedMessage.TaggingAlreadyRemoved,
          };
      }
    }

    const tagging = result.data;

    const neo4jResult = await removeInNeo4j({ prisma, neo4j }, tagging.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "RemoveTagFromVideoSucceededPayload",
      tag: new TagDTO(tagging.tag),
      video: new VideoDTO(tagging.video),
    };
  }) satisfies MutationResolvers["removeTagFromVideo"];
