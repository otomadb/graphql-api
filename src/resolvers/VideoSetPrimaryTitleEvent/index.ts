import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

const schemaPayload = z.object({ id: z.string() });
export type VideoSetPrimaryTitleEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoSetPrimaryTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({} satisfies Resolvers["VideoSetPrimaryTitleEvent"]);
