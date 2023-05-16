import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { YoutubeRegistrationRequestModel } from "../YoutubeRegistrationRequest/model.js";

export const resolverYoutubeRegistrationRequestAccepting = ({
  prisma,
  logger,
  userRepository,
}: Pick<ResolverDeps, "logger" | "prisma" | "userRepository">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new YoutubeRegistrationRequestModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", requestId);
        }),
    acceptedBy: async ({ checkedById }) => userRepository.getById(checkedById),
    video: async ({ videoId }, _args, _ctx, info) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch((e) => {
          logger.error({ error: e, path: info.path }, "Video not found");
          throw new GraphQLError("Something wrong happened");
        }),
  } satisfies Resolvers["YoutubeRegistrationRequestAccepting"]);
