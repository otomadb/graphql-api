import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoVideoSourceEventModel } from "../NicovideoVideoSourceEvent/model.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";

export const resolveNicovideoVideoSource = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("NicovideoVideoSource", id),
    url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    embedUrl: ({ sourceId }) => `https://embed.nicovideo.jp/watch/${sourceId}`,
    video: async ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),

    events: async ({ id }, { input }) => {
      const nodes = await prisma.nicovideoVideoSourceEvent
        .findMany({
          where: { sourceId: id },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new NicovideoVideoSourceEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["NicovideoVideoSource"]);
