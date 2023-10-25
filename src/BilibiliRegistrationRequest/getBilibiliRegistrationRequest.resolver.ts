import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { BilibiliRegistrationRequestDTO } from "./BilibiliRegistrationRequest.dto.js";

export const resolverGetBilibiliRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, _ctx, info) =>
    prisma.bilibiliRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("BilibiliRegistrationRequest", id) } })
      .then((v) => BilibiliRegistrationRequestDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id } }, "Not found");
        throw new GraphQLNotExistsInDBError("BilibiliRegistrationRequest", id);
      })) satisfies QueryResolvers["getBilibiliRegistrationRequest"];
