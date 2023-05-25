import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

export const resolverGetTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.tag
      .findUniqueOrThrow({ where: { id: parseGqlID("Tag", id) } })
      .then((v) => new TagDTO(v))
      .catch(() => {
        logger.error({ path: info.path, variables: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Tag", id);
      })) satisfies QueryResolvers["getTag"];
