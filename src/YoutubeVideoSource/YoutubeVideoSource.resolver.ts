import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { Resolvers, YoutubeVideoSourceResolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoModel } from "../resolvers/Video/model.js";
import { isErr } from "../utils/Result.js";
import { YoutubeVideoSourceEventConnectionDTO } from "./dto.js";

export const resolveYoutubeVideoSourceEvents = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        prisma.youtubeVideoSourceEvent.findMany({
          ...args,
          where: { sourceId: id },
          orderBy: orderBy.data,
        }),
      () => prisma.youtubeVideoSourceEvent.count(),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => YoutubeVideoSourceEventConnectionDTO.fromPrisma(c));
  }) satisfies YoutubeVideoSourceResolvers["events"];

export const resolveYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
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
