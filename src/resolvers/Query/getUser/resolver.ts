import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const getUser = ({ userRepository }: Pick<ResolverDeps, "userRepository">) =>
  (async (_parent, { id }) => userRepository.getById(id)) satisfies QueryResolvers["getUser"];
