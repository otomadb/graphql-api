import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { NotificationConnectionDTO } from "./NotificationConnection.dto.js";

export const resolverNotifications: MkQueryResolver<"notifications", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (
    _parent,
    { input: { orderBy: unparsedOrderBy, filter, ...unparsedConnectionArgs } },
    { currentUser: ctxUser },
    info,
  ) => {
    if (!ctxUser) return null;

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
        z.object({}),
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
        prisma.notification.findMany({
          ...args,
          where: {
            notifyToId: ctxUser.id,
            isWatched: filter.watched?.valueOf(),
          },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.notification.count({
          where: {
            notifyToId: ctxUser.id,
            isWatched: filter.watched?.valueOf(),
          },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => NotificationConnectionDTO.fromPrisma(c));
  };
