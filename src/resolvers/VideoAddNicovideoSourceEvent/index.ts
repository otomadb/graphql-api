import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";

export const resolveVideoAddNicovideoSourceEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    source: ({ payload }) =>
      prisma.nicovideoVideoSource
        .findUniqueOrThrow({ where: { id: payload.id } })
        .then((v) => new NicovideoVideoSourceModel(v)),
  } satisfies Resolvers["VideoAddNicovideoSourceEvent"]);
