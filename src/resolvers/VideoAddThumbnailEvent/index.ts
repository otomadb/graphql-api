import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoAddThumbnailEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoAddThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    thumbnailUrl: ({ payload }) =>
      prisma.videoThumbnail
        .findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } })
        .then((v) => v.imageUrl),
  } satisfies Resolvers["VideoAddThumbnailEvent"]);
