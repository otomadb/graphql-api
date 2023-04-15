import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";
import { ResolverDeps } from "../../types.js";

export const getMylistGroup = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.mylistGroup
      .findUniqueOrThrow({ where: { id: parseGqlID("MylistGroup", id) } })
      .then((v) => new MylistGroupModel(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("MylistGroup", id);
      })) satisfies QueryResolvers["getMylistGroup"];
