import { Tag, UserRole, Video, VideoTag, VideoTagEventType } from "@prisma/client";

import { Result } from "../../../utils/Result.js";
import { MutationResolvers, RemoveTagFromVideoFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";
import { removeInNeo4j } from "./neo4j.js";

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { authUserId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"NO_VIDEO" | "NO_TAG" | "NO_TAGGING" | "REMOVED_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  if ((await prisma.video.findUnique({ where: { id: videoId } })) === null)
    return { status: "error", error: "NO_VIDEO" };
  if ((await prisma.tag.findUnique({ where: { id: tagId } })) === null) return { status: "error", error: "NO_TAG" };

  const extTagging = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (extTagging === null) return { status: "error", error: "NO_TAGGING" };
  if (extTagging.isRemoved) return { status: "error", error: "REMOVED_TAGGING" };

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
  return { status: "ok", data: tagging };
};

export const removeTagFromVideo = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }, info) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.InvalidVideoId,
      };

    const tagId = parseGqlID2("Tag", tagGqlId);
    if (tagId.status === "error")
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.InvalidTagId,
      };

    const result = await remove(prisma, {
      videoId: videoId.data,
      tagId: tagId.data,
      authUserId: user.id,
    });
    if (result.status === "error") {
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
    if (neo4jResult.status === "error") {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "RemoveTagFromVideoSucceededPayload",
      tag: new TagModel(tagging.tag),
      video: new VideoModel(tagging.video),
    };
  }) satisfies MutationResolvers["removeTagFromVideo"];
