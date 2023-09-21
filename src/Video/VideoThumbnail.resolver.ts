import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO, VideoThumbnailEventDTO } from "./dto.js";

export const resolveVideoThumbnail = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("VideoThumbnail", id),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),

    events: async ({ id }, { input }) => {
      const nodes = await prisma.videoThumbnailEvent
        .findMany({
          where: { videoThumbnailId: id },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new VideoThumbnailEventDTO(e)));
      return { nodes };
    },
  }) satisfies Resolvers["VideoThumbnail"];
