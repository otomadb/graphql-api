import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";

const schemaPayload = z.object({
  /**
   * VideoTagのID
   */
  id: z.string(),
});
export type VideoAddTagEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoAddTagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    tag: async ({ payload }) =>
      prisma.videoTag
        .findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id }, select: { tag: true } })
        .then(({ tag }) => new TagModel(tag)),
  } satisfies Resolvers["VideoAddTagEvent"]);
