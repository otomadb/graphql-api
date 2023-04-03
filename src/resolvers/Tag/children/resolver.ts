import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { TagResolvers } from "../../graphql.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { TagParentConnectionModel } from "../../TagParentConnection/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverChildren = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: tagId, isCategoryTag }, { orderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
    const connectionArgs = z
      .union(
        isCategoryTag
          ? [
              z.object({ first: z.number(), after: z.string().optional() }),
              z.object({ last: z.number(), before: z.string().optional() }),
            ]
          : [
              z.object({}), // カテゴリータグでない場合は全取得を許容
              z.object({ first: z.number(), after: z.string().optional() }),
              z.object({ last: z.number(), before: z.string().optional() }),
            ]
      )
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
        prisma.tagParent.findMany({
          ...args,
          where: { parentId: tagId },
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
        }),
      () =>
        prisma.tagParent.count({
          where: { parentId: tagId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => TagParentConnectionModel.fromPrisma(c));
  }) satisfies TagResolvers["children"];
