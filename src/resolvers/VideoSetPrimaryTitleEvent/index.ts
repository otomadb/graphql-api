import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoSetPrimaryTitleEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoSetPrimaryTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    title: ({ payload }) =>
      prisma.videoTitle.findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } }).then((v) => v.title),
  } satisfies Resolvers["VideoSetPrimaryTitleEvent"]);
