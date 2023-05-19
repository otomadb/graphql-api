import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO, VideoTitleEventDTO } from "./dto.js";

export const resolveVideoTitle = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("VideoTitle", id),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),

    events: async ({ id }, { input }) => {
      const nodes = await prisma.videoTitleEvent
        .findMany({
          where: { videoTitleId: id },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new VideoTitleEventDTO(e)));
      return { nodes };
    },
  } satisfies Resolvers["VideoTitle"]);
