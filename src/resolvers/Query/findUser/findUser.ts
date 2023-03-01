import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const findUser = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { name } }, { user: ctxUser }, info) => {
    if (!name) {
      logger.error({ path: info.path, args: { input: { name } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("name must be provided"); // TODO: error messsage
    }

    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) {
      logger.warn({ path: info.path, args: { input: { name } }, userId: ctxUser?.id }, "Not found");
      throw new GraphQLError("Not Found");
    }

    return new UserModel(user);
  }) satisfies QueryResolvers["findUser"];
