import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoRemoveThumbnailEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoRemoveThumbnailEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
  } satisfies Resolvers["VideoRemoveThumbnailEvent"]);
