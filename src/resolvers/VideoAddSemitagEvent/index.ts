import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { SemitagModel } from "../Semitag/model.js";

export const resolveVideoAddSemitagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    semitag: ({ payload }) =>
      prisma.semitag.findUniqueOrThrow({ where: { id: payload.id } }).then((v) => new SemitagModel(v)),
  } satisfies Resolvers["VideoAddSemitagEvent"]);
