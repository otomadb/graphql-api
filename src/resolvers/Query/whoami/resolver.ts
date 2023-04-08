import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverWhoami = ({ userRepository }: Pick<ResolverDeps, "userRepository">) =>
  (async (_parent, _args, { currentUser }) =>
    userRepository.getById(currentUser.id).catch(() => {
      throw new GraphQLError("Internal server error");
    })) satisfies QueryResolvers["whoami"];
