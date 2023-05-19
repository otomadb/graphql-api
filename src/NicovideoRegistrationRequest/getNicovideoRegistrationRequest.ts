import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoRegistrationRequestDTO } from "./dto.js";

export const resolverGetNicovideoRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.nicovideoRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoRegistrationRequest", id) } })
      .then((v) => new NicovideoRegistrationRequestDTO(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", id);
      })) satisfies QueryResolvers["getNicovideoRegistrationRequest"];
