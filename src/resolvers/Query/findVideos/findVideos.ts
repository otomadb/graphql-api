import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { QueryResolvers } from "../../graphql.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";
import { VideoConnectionModel } from "../../VideoConnection/model.js";

export const findVideos = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ((_parent, { orderBy, ...unparsedConnectionArgs }, { user: ctxUser }, info) => {
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
      logger.error(
        { path: info.path, args: { orderBy, ...unparsedConnectionArgs }, userId: ctxUser?.id },
        "Wrong args"
      );
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.video.findMany({
          ...args,
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
        }),
      () => prisma.video.count(),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => VideoConnectionModel.fromPrisma(c));
  }) satisfies QueryResolvers["findVideos"];
