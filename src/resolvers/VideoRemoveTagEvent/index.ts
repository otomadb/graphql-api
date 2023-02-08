import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({ tagId: z.string() });
export type VideoRemoveTagEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoRemoveTagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    tag: async ({ payload }) =>
      prisma.tag
        .findUniqueOrThrow({
          where: { id: schemaPayload.parse(payload).tagId },
        })
        .then((t) => new TagModel(t)),
  } satisfies Resolvers["VideoRemoveTagEvent"]);
