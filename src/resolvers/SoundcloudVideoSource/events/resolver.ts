import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { SoundcloudVideoSourceResolvers } from "../../graphql.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { SoundcloudVideoSourceEventConnectionModel } from "../../SoundcloudVideoSourceEventConnection/model.js";
import { ResolverDeps } from "../../types.js";

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
    ).then((c) => SoundcloudVideoSourceEventConnectionModel.fromPrisma(c));
  }) satisfies SoundcloudVideoSourceResolvers["events"];
