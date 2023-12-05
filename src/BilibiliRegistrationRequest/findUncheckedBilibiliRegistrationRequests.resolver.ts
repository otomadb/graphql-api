import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { QueryResolvers } from "../resolvers/graphql.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { BilibiliRegistrationRequestConnectionDTO } from "./BilibiliRegistrationRequestConnection.dto.js";

export const resolverFindUncheckedBilibiliRegistrationRequests = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { orderBy: unparsedOrderBy, ...unparsedConnectionArgs } }, { currentUser: ctxUser }, info) => {
    const connectionArgs = z
      .union([
        z.object({
          first: z.number(),
          after: z.string().optional().nullable(),
        }),
        z.object({
          last: z.number(),
          before: z.string().optional().nullable(),
        }),
      ])
      .safeParse(unparsedConnectionArgs);
    if (!connectionArgs.success) {
      logger.error(
        { path: info.path, args: unparsedConnectionArgs, error: connectionArgs.error, userId: ctxUser?.id },
        "Wrong args",
      );
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.bilibiliRegistrationRequest.findMany({
          where: { isChecked: false },
          orderBy: orderBy.data,
          ...args,
        }),
      () =>
        prisma.bilibiliRegistrationRequest.count({
          where: { isChecked: false },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => BilibiliRegistrationRequestConnectionDTO.fromPrisma(c));
  }) satisfies QueryResolvers["findUncheckedBilibiliRegistrationRequests"];
