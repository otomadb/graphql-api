import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { buildGqlId } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { MkResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { SoundcloudMADSourceEventConnectionDTO } from "./SoundcloudMADSourceEventConnection.dto.js";

export const mkSoundcloudMADSourceResolver: MkResolver<
  "SoundcloudMADSource",
  "prisma" | "logger" | "SoundcloudService"
> = ({ prisma, logger, SoundcloudService }) => {
  return {
    id: ({ id }) => buildGqlId("SoundcloudMADSource", id),
    sourceId: ({ sourceId }) => sourceId,
    url: async ({ sourceId }) => {
      const result = await SoundcloudService.fetchFromSourceId(sourceId);
      if (isErr(result)) throw new GraphQLError("Something wrong");
      return result.data.url;
    },
    embedUrl: async ({ sourceId }) => {
      const result = await SoundcloudService.getEmbedUrl(sourceId);
      if (isErr(result)) throw new GraphQLError("Something wrong");
      return result.data;
    },
    video: ({ videoId }) => VideoDTO.getPrismaClientById(prisma, videoId),
    events: ({ id }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, _ctx, info) => {
      const connectionArgs = z
        .union([
          z.object({}), // 全ての取得を許容する
          z.object({ first: z.number(), after: z.string().optional() }),
          z.object({ last: z.number(), before: z.string().optional() }),
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
          prisma.bilibiliMADSourceEvent.findMany({
            ...args,
            where: { sourceId: id },
            orderBy: orderBy.data,
          }),
        () => prisma.bilibiliMADSourceEvent.count(),
        connectionArgs.data,
        { resolveInfo: info, ...cursorOptions },
      ).then((c) => SoundcloudMADSourceEventConnectionDTO.fromPrisma(c));
    },
  };
};
