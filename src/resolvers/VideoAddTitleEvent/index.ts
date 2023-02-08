import z from "zod";

import { Resolvers } from "../graphql.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoAddTitleEventPayload = z.infer<typeof schemaPayload>;

import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

export const resolveVideoAddTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    title: ({ payload }) =>
      prisma.videoTitle.findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } }).then((v) => v.title),
  } satisfies Resolvers["VideoAddTitleEvent"]);
