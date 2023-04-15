import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SemitagEventModel } from "../SemitagEvent/model.js";
import { SemitagRejectingModel } from "../SemitagRejecting/model.js";
import { SemitagResolvingModel } from "../SemitagResolving/model.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { resolverSemitagSuggestTags } from "./suggestTags/resolver.js";

export const resolveSemitag = ({ prisma, meilisearch }: Pick<ResolverDeps, "meilisearch" | "prisma">) =>
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
      if (!videoTagId) return SemitagRejectingModel.make({ note, semitagId });
      return SemitagResolvingModel.make({ videoTagId, note, semitagId });
    },
    suggestTags: resolverSemitagSuggestTags({ meilisearch }),
  } satisfies Resolvers["Semitag"]);
