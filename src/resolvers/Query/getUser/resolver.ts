import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const getUser = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.user
      .findUniqueOrThrow({ where: { id: parseGqlID("User", id) } })
      .then((v) => new UserModel(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("User", id);
      })) satisfies QueryResolvers["getUser"];
