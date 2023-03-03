import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { VideoResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { VideoTagConnectionModel } from "../../VideoTagConnection/model.js";

export const resolveTaggings = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, { orderBy, ...unparsedConnectionArgs }, { user: ctxUser }, info) => {
    const connectionArgs = z
      .union([
        z.object({}), // 全てのVideoTagの取得を許容する
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
        prisma.videoTag.findMany({
          ...args,
          where: { videoId },
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
        }),
      () => prisma.videoTag.count({ where: { videoId } }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => VideoTagConnectionModel.fromPrisma(c));
  }) satisfies VideoResolvers["taggings"];
