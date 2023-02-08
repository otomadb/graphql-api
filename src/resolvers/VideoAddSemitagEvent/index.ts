import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { SemitagModel } from "../Semitag/model.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

const schemaPayload = z.object({
  /**
   * SemitagのID
   */
  id: z.string(),
});
export type VideoAddSemitagEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoAddSemitagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
    semitag: ({ payload }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } })
        .then((v) => new SemitagModel(v)),
  } satisfies Resolvers["VideoAddSemitagEvent"]);
