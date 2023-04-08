import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const findUser = ({
  logger,
  auth0Management,
  cache,
}: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management" | "cache">) =>
  (async (_parent, { input: { name } }, { currentUser: ctxUser }, info) => {
    if (!name) {
      logger.error({ path: info.path, args: { input: { name } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("name must be provided"); // TODO: error messsage
    }

    const auth0user = (await auth0Management.getUsers({ q: `username:"${name}"` })).at(0);

    if (!auth0user) {
      logger.info({ path: info.path, name }, "Not found");
      return null;
    }
    return UserModel.fromAuth0User({ logger, cache }, auth0user).catch(() => {
      throw new GraphQLError("Internal server error");
    });
  }) satisfies QueryResolvers["findUser"];
