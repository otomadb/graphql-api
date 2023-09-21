import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../resolvers/connection.js";
import { QueryResolvers } from "../resolvers/graphql.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { NicovideoRegistrationRequestConnectionDTO } from "./dto.js";

export const findNicovideoRegistrationRequests = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { orderBy: unparsedOrderBy, checked, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        prisma.nicovideoRegistrationRequest.findMany({
          where: { isChecked: checked?.valueOf() },
          orderBy: orderBy.data,
          ...args,
        }),
      () => prisma.nicovideoRegistrationRequest.count({ where: { isChecked: checked?.valueOf() } }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions },
    ).then((c) => NicovideoRegistrationRequestConnectionDTO.fromPrisma(c));
  }) satisfies QueryResolvers["findNicovideoRegistrationRequests"];
