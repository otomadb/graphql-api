import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { MylistShareRange as GqlMylistShareRange, UserResolvers } from "../../graphql.js";
import { MylistConnectionModel } from "../../MylistConnection/model.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverUserMylists = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: userId },
    { orderBy: unparsedOrderBy, range, ...unparsedConnectionArgs },
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
        z.object({}), // 全てのMylistの取得を許容する
      ])
      .safeParse(unparsedConnectionArgs);
    if (!connectionArgs.success) {
      logger.error({ path: info.path, args: unparsedConnectionArgs }, "Wrong args");
      throw new GraphQLError("Wrong args");
    }

    const shareRange: MylistShareRange[] = [
      ...(range.includes(GqlMylistShareRange.Public) ? [MylistShareRange.PUBLIC] : []),
      ...(range.includes(GqlMylistShareRange.KnowLink) ? [MylistShareRange.KNOW_LINK] : []),
      ...(range.includes(GqlMylistShareRange.Private) ? [MylistShareRange.PRIVATE] : []),
    ];

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.mylist.findMany({
          ...args,
          where: { holderId: userId, shareRange: { in: shareRange } },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.mylist.count({
          where: { holderId: userId, shareRange: { in: shareRange } },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => MylistConnectionModel.fromPrisma(c));
  }) satisfies UserResolvers["mylists"];
