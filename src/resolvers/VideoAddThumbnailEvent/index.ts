import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoAddThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    thumbnail: ({ payload }) =>
      prisma.videoThumbnail.findUniqueOrThrow({ where: { id: payload.id } }).then((v) => v.imageUrl),
  } satisfies Resolvers["VideoAddThumbnailEvent"]);
