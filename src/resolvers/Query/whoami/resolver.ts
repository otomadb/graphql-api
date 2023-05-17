import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverWhoami = ({ userService }: Pick<ResolverDeps, "userService">) =>
  (async (_parent, _args, { currentUser }) =>
    userService.getById(currentUser.id).catch(() => {
      throw new GraphQLError("Internal server error");
    })) satisfies QueryResolvers["whoami"];
