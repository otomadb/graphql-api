import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoVideoSourceDTO } from "./dto.js";

export const getNicovideoVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.nicovideoVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoVideoSource", id) } })
      .then((v) => new NicovideoVideoSourceDTO(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("NicovideoVideoSource", id);
      })) satisfies QueryResolvers["getNicovideoVideoSource"];
