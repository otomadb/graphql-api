import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { SemitagConnectionModel } from "../../SemitagConnection/model.js";

export const findSemitags = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { orderBy, checked, ...unparsedConnectionArgs }, { user: ctxUser }, info) => {
    const connectionArgs = z
      .union([
        z.object({}),
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
        prisma.semitag.findMany({
          ...args,
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
          where: { isChecked: checked?.valueOf() },
        }),
      () => prisma.semitag.count(),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => SemitagConnectionModel.fromPrisma(c));
  }) satisfies QueryResolvers["findSemitags"];
