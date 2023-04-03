import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const getUser = ({ auth0Management }: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management">) =>
  (async (_parent, { id }) =>
    UserModel.fromAuth0User(await auth0Management.getUser({ id }))) satisfies QueryResolvers["getUser"];
