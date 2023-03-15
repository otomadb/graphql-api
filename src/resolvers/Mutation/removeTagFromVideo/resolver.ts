import { UserRole } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, RemoveTagFromVideoFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { removeInNeo4j } from "./neo4j.js";
import { remove } from "./prisma.js";

export const resolverRemoveTagFromVideo = ({
  prisma,
  neo4j,
  logger,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }, info) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RemoveTagFromVideoFailedPayload",
        message: RemoveTagFromVideoFailedMessage.Forbidden,
      };

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
      tag: new TagModel(tagging.tag),
      video: new VideoModel(tagging.video),
    };
  }) satisfies MutationResolvers["removeTagFromVideo"];
