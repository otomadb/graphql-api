import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoRemoveThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({} satisfies Resolvers["VideoRemoveThumbnailEvent"]);
