import { GraphQLError } from "graphql";

import { isErr } from "../../utils/Result.js";
import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { resolveSoundcloudVideoSourceEvents } from "./events/resolver.js";

export const resolveSoundcloudVideoSource = ({
  prisma,
  logger,
  soundcloudService,
}: Pick<ResolverDeps, "prisma" | "logger" | "soundcloudService">) =>
  ({
    id: ({ id }) => buildGqlId("SoundcloudVideoSource", id),
    url: async ({ sourceId }) => {
      const result = await soundcloudService.fetchUrl(sourceId);
      if (isErr(result)) {
        logger.error({ error: result.error }, "Failed to fetch url");
        throw new GraphQLError("Internal Server Error");
      }
      return result.data;
    },
    embedUrl: async ({ sourceId }) => {
      const result = await soundcloudService.fetchEmbedUrl(sourceId);
      if (isErr(result)) {
        logger.error({ error: result.error }, "Failed to fetch url");
        throw new GraphQLError("Internal Server Error");
      }
      return result.data;
    },
    video: async ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    events: resolveSoundcloudVideoSourceEvents({ prisma, logger }),
  } satisfies Resolvers["SoundcloudVideoSource"]);
