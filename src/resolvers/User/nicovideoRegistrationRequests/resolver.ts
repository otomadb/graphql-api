import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { UserResolvers } from "../../graphql.js";
import { NicovideoRegistrationRequestConnectionModel } from "../../NicovideoRegistrationRequestConnection/model.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverUserNicovideoRegistrationRequests = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: userId }, { orderBy: unparsedOrderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
        prisma.nicovideoRegistrationRequest.findMany({
          ...args,
          where: { requestedById: userId },
          orderBy: orderBy.data,
        }),
      () =>
        prisma.nicovideoRegistrationRequest.count({
          where: { requestedById: userId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => NicovideoRegistrationRequestConnectionModel.fromPrisma(c));
  }) satisfies UserResolvers["nicovideoRegistrationRequests"];
