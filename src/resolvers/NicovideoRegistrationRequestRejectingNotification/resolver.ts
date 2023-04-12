import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../types.js";

export const resolverNicovideoRegistrationRequestResolvingNotification = ({
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({} satisfies Resolvers["NicovideoRegistrationRequestRejectingNotification"]);
