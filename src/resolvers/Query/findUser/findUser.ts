import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const findUser = ({ logger, auth0Management }: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management">) =>
  (async (_parent, { input: { name } }, { currentUser: ctxUser }, info) => {
    if (!name) {
      logger.error({ path: info.path, args: { input: { name } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("name must be provided"); // TODO: error messsage
    }

    const user = (await auth0Management.getUsers({ q: `name:"${name}"` })).at(0);
    if (!user) {
      logger.info({ path: info.path, name }, "Not found");
      return null;
    }
    return UserModel.fromAuth0User(user);
  }) satisfies QueryResolvers["findUser"];
