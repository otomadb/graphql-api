import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { UserResolvers } from "../../graphql.js";
import { NotificationConnectionModel } from "../../NotificationConnection/model.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverUserNotifications = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: userId },
    { orderBy: unparsedOrderBy, filter, ...unparsedConnectionArgs },
    { currentUser: ctxUser },
    info
  ) => {
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
      logger.error({ path: info.path, args: unparsedConnectionArgs, userId: ctxUser?.id }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy, ["createdAt", "asc"]);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy, userId: ctxUser?.id }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.notification.findMany({
          ...args,
          where: { notifyToId: userId },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.notification.count({
          where: { notifyToId: userId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => NotificationConnectionModel.fromPrisma(c));
  }) satisfies UserResolvers["notifications"];
