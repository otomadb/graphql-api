import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { TagResolvers } from "../../graphql.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";
import { VideoTagConnectionModel } from "../../VideoTagConnection/model.js";

export const resolveTaggedVideos = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: tagId }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        prisma.videoTag.findMany({
          ...args,
          where: { tagId },
          orderBy: orderBy.data,
        }),
      () => prisma.videoTag.count({ where: { tagId } }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => VideoTagConnectionModel.fromPrisma(c));
  }) satisfies TagResolvers["taggedVideos"];
