import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { buildGqlId, parseGqlID3 } from "../../id.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { ResolverDeps } from "../../types.js";
import { likeVideoInNeo4j } from "./neo4j.js";
import { like } from "./prisma.js";

export const resolverLikeVideo = ({
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

    const result = await like(prisma, { userId: user.id, videoId: videoId.data });
    if (isErr(result)) {
      switch (result.error.type) {
        case "VIDEO_NOT_FOUND":
          return {
            __typename: "MutationVideoNotFoundError",
            videoId: buildGqlId("Video", videoId.data),
          } satisfies ResolversTypes["LikeVideoReturnUnion"];
        case "ALREADY_REGISTERED":
          return {
            __typename: "LikeVideoAlreadyLikedError",
            registration: new MylistRegistrationModel(result.error.registration),
          } satisfies ResolversTypes["LikeVideoReturnUnion"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
      }
    }

    const registration = result.data;

    const neo4jResult = await likeVideoInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "LikeVideoSucceededPayload",
      registration: new MylistRegistrationModel(registration),
      user: await userService.getById(user.id),
    } satisfies ResolversTypes["LikeVideoReturnUnion"];
  }) satisfies MutationResolvers["likeVideo"];
