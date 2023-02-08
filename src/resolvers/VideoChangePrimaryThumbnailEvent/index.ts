import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoChangePrimaryThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({} satisfies Resolvers["VideoChangePrimaryThumbnailEvent"]);
