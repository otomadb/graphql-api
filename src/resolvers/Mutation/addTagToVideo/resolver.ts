import { UserRole } from "@prisma/client";

import { isErr } from "../../../utils/Result.js";
import { AddTagToVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { addTagToVideoInNeo4j } from "./neo4j.js";
import { add } from "./prisma.js";

export const resolverAddTagToVideo = ({ neo4j, prisma, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { currentUser: user }, info) => {
    if (!user || (user?.role !== UserRole.EDITOR && user?.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "AddTagToVideoFailedPayload",
        message: AddTagToVideoFailedMessage.Forbidden,
      };

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

      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
