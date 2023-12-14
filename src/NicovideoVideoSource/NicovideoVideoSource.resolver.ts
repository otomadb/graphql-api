import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { MkResolver } from "../utils/MkResolver.js";
import { VideoDTO } from "../Video/dto.js";
import { NicovideoVideoSourceEventDTO } from "./dto.js";

export const mkNicovideoVideoSourceResolver: MkResolver<"NicovideoVideoSource", "prisma"> = ({
  prisma,
}: Pick<ResolverDeps, "prisma">) => ({
  id: ({ id }) => buildGqlId("NicovideoVideoSource", id),
  url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
  embedUrl: ({ sourceId }) => `https://embed.nicovideo.jp/watch/${sourceId}`,
  sourceId: ({ sourceId }) => sourceId,
  registeredAt: ({ registeredAt }) => registeredAt,
  video: async ({ videoId }) =>
    prisma.video
      .findUniqueOrThrow({ where: { id: videoId } })
      .then((v) => new VideoDTO(v))
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
      .then((es) => es.map((e) => new NicovideoVideoSourceEventDTO(e)));
    return { nodes };
  },
});
