import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoSetPrimaryThumbnailEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoSetPrimaryThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    thumbnailUrl: ({ payload }) =>
      prisma.videoThumbnail
        .findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } })
        .then((v) => v.imageUrl),
  } satisfies Resolvers["VideoSetPrimaryThumbnailEvent"]);
