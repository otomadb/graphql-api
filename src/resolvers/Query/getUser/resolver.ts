import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const getUser = ({ auth0Management, logger }: Pick<ResolverDeps, "logger" | "auth0Management">) =>
  (async (_parent, { id }) => UserModel.fromAuth0({ auth0Management, logger }, id)) satisfies QueryResolvers["getUser"];
