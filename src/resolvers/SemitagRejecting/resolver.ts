import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel } from "../Semitag/model.js";
import { ResolverDeps } from "../types.js";
import { SemitagRejectingModel } from "./model.js";

export const resolverSemitagRejecting = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagRejectingModel,
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((s) => SemitagModel.fromPrisma(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  } satisfies Resolvers["SemitagRejecting"]);
