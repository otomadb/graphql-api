import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverChangeUserDisplayName = ({ userService }: Pick<ResolverDeps, "userService">) =>
  (async (_parent, { renameTo }, { currentUser }) => {
    const user = await userService.changeDisplayName(currentUser.id, renameTo);
    return {
      __typename: "ChangeUserDisplayNameSucceededPayload",
      user,
    } satisfies ResolversTypes["ChangeUserDisplayNameReturnUnion"];
  }) satisfies MutationResolvers["changeUserDisplayName"];
