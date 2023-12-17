import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { MylistResolvers } from "../../graphql.js";
import { MylistRegistrationConnectionModel } from "../../MylistRegistrationConnection/model.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverMylistRegistrations = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (
    { id: mylistId },
    { orderBy: unparsedOrderBy, ...unparsedConnectionArgs },
    { currentUser: ctxUser },
    info,
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
        prisma.mylistRegistration.findMany({
          ...args,
          where: { mylistId, isRemoved: false },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.mylistRegistration.count({
          where: { mylistId, isRemoved: false },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => MylistRegistrationConnectionModel.fromPrisma(c));
  }) satisfies MylistResolvers["registrations"];
