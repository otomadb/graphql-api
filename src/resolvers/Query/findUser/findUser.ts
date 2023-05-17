import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const findUser = ({ logger, userService }: Pick<ResolverDeps, "logger" | "userService">) =>
  (async (_parent, { input: { name } }, { currentUser: ctxUser }, info) => {
    if (!name) {
      logger.error({ path: info.path, args: { input: { name } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("name must be provided"); // TODO: error messsage
    }

    return userService.findByName(name);
  }) satisfies QueryResolvers["findUser"];
