import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({
  tagId: z.string(),
});
export type VideoAddTagEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoAddTagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    tag: async ({ videoId, payload }) =>
      prisma.videoTag
        .findUniqueOrThrow({
          where: { videoId_tagId: { videoId, tagId: schemaPayload.parse(payload).tagId } },
          select: { tag: true },
        })
        .then(({ tag }) => new TagModel(tag)),
  } satisfies Resolvers["VideoAddTagEvent"]);
