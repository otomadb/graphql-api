import z from "zod";

import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";

const schemaPayload = z.object({
  /**
   * NicovideoSourceのID
   */
  id: z.string(),
});
export type VideoAddNicovideoSourceEventPayload = z.infer<typeof schemaPayload>;

export const resolveVideoAddNicovideoSourceEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    __isTypeOf({ type }) {
      return type === "ADD_NICOVIDEO_SOURCE";
    },
    source: ({ payload }) =>
      prisma.nicovideoVideoSource
        .findUniqueOrThrow({ where: { id: schemaPayload.parse(payload).id } })
        .then((v) => new NicovideoVideoSourceModel(v)),
  } satisfies Resolvers["VideoAddNicovideoSourceEvent"]);
