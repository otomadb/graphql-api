import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const getUser = ({ userService }: Pick<ResolverDeps, "userService">) =>
  (async (_parent, { id }) => userService.getById(id)) satisfies QueryResolvers["getUser"];
