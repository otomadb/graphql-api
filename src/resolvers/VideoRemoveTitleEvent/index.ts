import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoRemoveTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({} satisfies Resolvers["VideoRemoveTitleEvent"]);
