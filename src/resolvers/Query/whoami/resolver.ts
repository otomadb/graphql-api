import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const resolverWhoami = ({
  auth0Management,
  logger,
  cache,
}: Pick<ResolverDeps, "auth0Management" | "logger" | "cache">) =>
  (async (_parent, _args, { currentUser }) =>
    UserModel.fromAuth0({ auth0Management, logger, cache }, currentUser.id).catch(() => {
      throw new GraphQLError("Internal server error");
    })) satisfies QueryResolvers["whoami"];
