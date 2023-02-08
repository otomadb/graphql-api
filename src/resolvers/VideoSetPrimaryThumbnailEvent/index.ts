import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoSetPrimaryThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    thumbnail: ({ payload }) =>
      prisma.videoThumbnail.findUniqueOrThrow({ where: { id: payload.id } }).then((v) => v.imageUrl),
  } satisfies Resolvers["VideoSetPrimaryThumbnailEvent"]);
