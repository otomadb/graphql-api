import { UserResolvers, UserRole } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";

export const resolverUserHasRole = ({ userRepository }: Pick<ResolverDeps, "userRepository">) =>
  (async ({ id: userId }, { role }) => {
    switch (role) {
      case UserRole.Admin:
        return userRepository.hasRole(userId, "ADMIN");
      case UserRole.Editor:
        return userRepository.hasRole(userId, "EDITOR");
    }
  }) satisfies UserResolvers["hasRole"];
