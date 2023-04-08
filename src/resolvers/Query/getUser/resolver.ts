import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const getUser = ({
  auth0Management,
  logger,
  cache,
}: Pick<ResolverDeps, "logger" | "auth0Management" | "cache">) =>
  (async (_parent, { id }) =>
    UserModel.fromAuth0({ auth0Management, logger, cache }, id)) satisfies QueryResolvers["getUser"];
