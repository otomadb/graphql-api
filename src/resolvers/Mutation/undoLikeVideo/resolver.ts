import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { buildGqlId, parseGqlID3 } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { undoLikeVideoInNeo4j } from "./neo4j.js";
import { undo } from "./prisma.js";

export const resolverUndoLikeVideo = ({
  prisma,
  neo4j,
  logger,
  userService,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "userService">) =>
  (async (_parent, { input: { videoId: videoGqlId } }, { currentUser: user }, info) => {
    const videoId = parseGqlID3("Video", videoGqlId);
    if (isErr(videoId)) {
      return {
        __typename: "MutationInvalidVideoIdError",
        videoId: videoId.error.invalidId,
      } satisfies ResolversTypes["LikeVideoReturnUnion"];
    }

    const result = await undo(prisma, { userId: user.id, videoId: videoId.data });
    if (isErr(result)) {
      switch (result.error.type) {
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
        case "VIDEO_NOT_FOUND":
          return {
            __typename: "MutationVideoNotFoundError",
            videoId: buildGqlId("Video", result.error.videoId),
          } satisfies ResolversTypes["UndoLikeVideoReturnUnion"];
      }
    }

    const registration = result.data;
    const neo4jResult = await undoLikeVideoInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "UndoLikeVideoSucceededPayload",
      user: await userService.getById(user.id),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
