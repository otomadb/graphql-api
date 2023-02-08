import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoSetPrimaryTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({} satisfies Resolvers["VideoSetPrimaryTitleEvent"]);
