import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { SemitagEventModel } from "../SemitagEvent/model.js";
import { VideoModel } from "../Video/model.js";
import { SemitagRejectingModel, SemitagResolvingModel } from "./model.js";

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

      const { videoTagId, note } = checking;
      if (!videoTagId) return new SemitagRejectingModel({ note });
      return new SemitagResolvingModel({ videoTagId, note });
    },
  } satisfies Resolvers["Semitag"]);

export const resolveSemitagResolving = () =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagResolvingModel,
  } satisfies Resolvers["SemitagResolving"]);

export const resolveSemitagRejecting = () =>
  ({
    __isTypeOf: (obj) => obj instanceof SemitagRejectingModel,
  } satisfies Resolvers["SemitagRejecting"]);
