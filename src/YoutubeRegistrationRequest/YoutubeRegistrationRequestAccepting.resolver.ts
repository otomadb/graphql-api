import { GraphQLError } from "graphql";

import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoModel } from "../resolvers/Video/model.js";
import { YoutubeRegistrationRequestDTO } from "./dto.js";

export const resolverYoutubeRegistrationRequestAccepting = ({
  prisma,
  logger,
  userRepository,
}: Pick<ResolverDeps, "logger" | "prisma" | "userRepository">) =>
  ({
    request: ({ requestId }) =>
      prisma.youtubeRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => YoutubeRegistrationRequestDTO.fromPrisma(u))
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