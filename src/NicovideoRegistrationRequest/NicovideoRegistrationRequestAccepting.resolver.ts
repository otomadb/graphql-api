import { GraphQLError } from "graphql";

import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO } from "../Video/dto.js";
import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const resolverNicovideoRegistrationRequestAccepting = ({
  prisma,
  logger,
  userService,
}: Pick<ResolverDeps, "logger" | "prisma" | "userService">) =>
  ({
    request: ({ requestId }) =>
      prisma.nicovideoRegistrationRequest
        .findUniqueOrThrow({ where: { id: requestId } })
        .then((u) => new NicovideoRegistrationRequestDTO(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", requestId);
        }),
    acceptedBy: async ({ checkedById }) => userService.getById(checkedById),
    video: async ({ videoId }, _args, _ctx, info) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch((e) => {
          logger.error({ error: e, path: info.path }, "Video not found");
          throw new GraphQLError("Something wrong happened");
        }),
  }) satisfies Resolvers["NicovideoRegistrationRequestAccepting"];
