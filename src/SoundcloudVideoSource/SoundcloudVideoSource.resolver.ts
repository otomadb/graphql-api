import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { Resolvers, SoundcloudVideoSourceResolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoModel } from "../resolvers/Video/model.js";
import { isErr } from "../utils/Result.js";
import { SoundcloudVideoSourceEventConnectionDTO } from "./dto.js";

export const resolveSoundcloudVideoSourceEvents = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, _ctx, info) => {
    const connectionArgs = z
      .union([
        z.object({
          first: z.number(),
          after: z.string().optional(),
        }),
        z.object({
          last: z.number(),
          before: z.string().optional(),
        }),
      ])
      .safeParse(unparsedConnectionArgs);
    if (!connectionArgs.success) {
      logger.error({ path: info.path, args: unparsedConnectionArgs }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.soundcloudVideoSourceEvent.findMany({
          ...args,
          where: { sourceId: id },
          orderBy: orderBy.data,
        }),
      () => prisma.soundcloudVideoSourceEvent.count(),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => SoundcloudVideoSourceEventConnectionDTO.fromPrisma(c));
  }) satisfies SoundcloudVideoSourceResolvers["events"];

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
