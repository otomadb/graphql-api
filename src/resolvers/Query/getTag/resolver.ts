import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";

export const getTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.tag
      .findUniqueOrThrow({ where: { id: parseGqlID("Tag", id) } })
      .then((v) => new TagModel(v))
      .catch(() => {
        logger.error({ path: info.path, variables: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Tag", id);
      })) satisfies QueryResolvers["getTag"];
