import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";

export const resolverGetUser = ({ userService }: Pick<ResolverDeps, "userService">) =>
  (async (_parent, { id }) => userService.getById(id)) satisfies QueryResolvers["getUser"];
