import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { VideoModel } from "../Video/model.js";
import { VideoTitleEventModel } from "../VideoTitleEvent/model.js";

export const resolveVideoTitle = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("VideoTitle", id),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
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
        .then((es) => es.map((e) => new VideoTitleEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["VideoTitle"]);
