import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { VideoModel } from "../Video/model.js";

export const resolveNicovideoVideoSource = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }) => buildGqlId("NicovideoVideoSource", id),
    url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    video: async ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
  } satisfies Resolvers["NicovideoVideoSource"]);
