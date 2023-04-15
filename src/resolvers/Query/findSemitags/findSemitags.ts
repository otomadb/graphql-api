import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { Prisma } from "@prisma/client";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { QueryResolvers } from "../../graphql.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { SemitagConnectionModel } from "../../SemitagConnection/model.js";
import { ResolverDeps } from "../../types.js";

export const findSemitags = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, args, { currentUser: ctxUser }, info) => {
    const { orderBy: unparsedOrderBy, checked, ...unparsedConnectionArgs } = args;
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
      logger.error({ path: info.path, args: unparsedConnectionArgs, userId: ctxUser?.id }, "Pagination args error");
      throw new GraphQLError("Pagination args error");
    }

    const orderBy = parseOrderBy(unparsedOrderBy, ["name", Prisma.SortOrder.desc]);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy, userId: ctxUser?.id }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.semitag.findMany({
          ...args,
          orderBy: orderBy.data,
          where: { isChecked: checked?.valueOf() },
        }),
      () => prisma.semitag.count(),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => SemitagConnectionModel.fromPrisma(c));
  }) satisfies QueryResolvers["findSemitags"];
