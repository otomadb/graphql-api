import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { VideoResolvers } from "../../graphql.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";
import { VideoTagConnectionModel } from "../../VideoTagConnection/model.js";

export const resolveTaggings = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async ({ id: videoId }, { orderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        z.object({}), // 全てのVideoTagの取得を許容する
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
        prisma.videoTag.findMany({
          ...args,
          where: {
            videoId,
            isRemoved: false,
          },
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
        }),
      () =>
        prisma.videoTag.count({
          where: {
            videoId,
            isRemoved: false,
          },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => VideoTagConnectionModel.fromPrisma(c));
  }) satisfies VideoResolvers["taggings"];
