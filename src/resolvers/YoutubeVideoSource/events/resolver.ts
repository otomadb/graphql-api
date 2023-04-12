import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { YoutubeVideoSourceResolvers } from "../../graphql.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";
import { YoutubeVideoSourceEventConnectionModel } from "../../YoutubeVideoSourceEventConnection/model.js";

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
      logger.error({ path: info.path, args: unparsedConnectionArgs, userId: ctxUser?.id }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy, ["createdAt", Prisma.SortOrder.desc]);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy, userId: ctxUser?.id }, "OrderBy args error");
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
    ).then((c) => YoutubeVideoSourceEventConnectionModel.fromPrisma(c));
  }) satisfies YoutubeVideoSourceResolvers["events"];
