import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const whoami = ({ auth0Management }: Pick<ResolverDeps, "auth0Management">) =>
  (async (_parent, _args, { currentUser }) => {
    return UserModel.fromAuth0User(await auth0Management.getUser({ id: currentUser.id }));
  }) satisfies QueryResolvers["whoami"];
