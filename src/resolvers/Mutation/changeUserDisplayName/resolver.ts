import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverChangeUserDisplayName = ({ userRepository }: Pick<ResolverDeps, "userRepository">) =>
  (async (_parent, { renameTo }, { currentUser }) => {
    const user = await userRepository.changeDisplayName(currentUser.id, renameTo);
    return {
      __typename: "ChangeUserDisplayNameSucceededPayload",
      user,
    } satisfies ResolversTypes["ChangeUserDisplayNameReturnUnion"];
  }) satisfies MutationResolvers["changeUserDisplayName"];
