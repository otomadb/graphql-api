import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const getTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { user: ctxUser }, info) =>
    prisma.tag
      .findUniqueOrThrow({ where: { id: parseGqlID("Tag", id) } })
      .then((v) => new TagModel(v))
      .catch(() => {
        logger.error({ path: info.path, variables: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Tag", id);
      })) satisfies QueryResolvers["getTag"];
