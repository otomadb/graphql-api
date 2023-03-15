import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagEventModel } from "../SemitagEvent/model.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { VideoTagModel } from "../VideoTag/model.js";
import { SemitagModel, SemitagRejectingModel, SemitagResolvingModel } from "./model.js";

export const resolveSemitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ dbId }): string => buildGqlId("Semitag", dbId),
    video: ({ videoId }) =>
      prisma.video
        .findFirstOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    events: async ({ dbId: semitagId }, { input }) => {
      const nodes = await prisma.semitagEvent
        .findMany({
          where: { semitagId },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new SemitagEventModel(e)));
      return { nodes };
    },
    check: async ({ dbId, checked }) => {
      if (!checked) return null; // checkedがfalseでcheckが存在することはありえない

      const checking = await prisma.semitagChecking.findUnique({ where: { semitagId: dbId } });
      if (!checking) return null;

      const { videoTagId, note, semitagId } = checking;
      if (!videoTagId) return new SemitagRejectingModel({ note, semitagId });
      return new SemitagResolvingModel({ videoTagId, note, semitagId });
    },
  } satisfies Resolvers["Semitag"]);

export const resolveSemitagResolving = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagResolvingModel,
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((s) => new SemitagModel(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),

    resolveTo: ({ videoTagId }) =>
      prisma.videoTag
        .findUniqueOrThrow({ where: { id: videoTagId } })
        .then((s) => new VideoTagModel(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("VideoTag", videoTagId);
        }),
  } satisfies Resolvers["SemitagResolving"]);

export const resolveSemitagRejecting = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagRejectingModel,
    semitag: ({ semitagId }) =>
      prisma.semitag
        .findUniqueOrThrow({ where: { id: semitagId } })
        .then((s) => new SemitagModel(s))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Semitag", semitagId);
        }),
  } satisfies Resolvers["SemitagRejecting"]);
