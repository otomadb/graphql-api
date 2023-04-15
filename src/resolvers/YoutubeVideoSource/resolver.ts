import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { resolveYoutubeVideoSourceEvents } from "./events/resolver.js";

export const resolveYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("YoutubeVideoSource", id),
    url: ({ sourceId }) => `https://www.youtube.com/watch?v=${sourceId}`,
    embedUrl: ({ sourceId }) => `https://www.youtube.com/embed/${sourceId}`,
    video: async ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),

    events: resolveYoutubeVideoSourceEvents({ prisma, logger }),
  } satisfies Resolvers["YoutubeVideoSource"]);
