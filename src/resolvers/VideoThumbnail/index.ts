import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { VideoModel } from "../Video/model.js";
import { VideoThumbnailEventModel } from "../VideoThumbnailEvent/model.js";

export const resolveVideoThumbnail = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("VideoThumbnail", id),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
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
        .then((es) => es.map((e) => new VideoThumbnailEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["VideoThumbnail"]);
