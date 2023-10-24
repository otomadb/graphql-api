import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeRegistrationRequestDTO } from "./YoutubeRegistrationRequest.dto.js";

export const resolverGetYoutubeRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, _ctx, info) =>
    prisma.youtubeRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("YoutubeRegistrationRequest", id) } })
      .then((v) => YoutubeRegistrationRequestDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id } }, "Not found");
        throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", id);
      })) satisfies QueryResolvers["getYoutubeRegistrationRequest"];
