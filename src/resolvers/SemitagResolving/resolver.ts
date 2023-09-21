import { VideoTagDTO } from "../../Video/dto.js";
import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { SemitagModel } from "../Semitag/model.js";
import { ResolverDeps } from "../types.js";
import { SemitagResolvingModel } from "./model.js";

export const resolverSemitagResolving = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagResolvingModel,
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((s) => SemitagModel.fromPrisma(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),

    resolveTo: ({ videoTagId }) =>
      prisma.videoTag
        .findUniqueOrThrow({ where: { id: videoTagId } })
        .then((s) => new VideoTagDTO(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("VideoTag", videoTagId);
        }),
  }) satisfies Resolvers["SemitagResolving"];
