import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { isErr } from "../../../utils/Result.js";
import { cursorOptions } from "../../connection.js";
import { QueryResolvers } from "../../graphql.js";
import { NicovideoRegistrationRequestConnectionModel } from "../../NicovideoRegistrationRequestConnection/model.js";
import { parseOrderBy2 } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverFindUncheckedNicovideoRegistrationRequests = ({
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
        "Wrong args"
      );
      throw new GraphQLError("Wrong args");
    }

    const orderBy = parseOrderBy2(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy, userId: ctxUser?.id }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.nicovideoRegistrationRequest.findMany({
          where: { isChecked: false },
          orderBy: orderBy.data,
          ...args,
        }),
      () =>
        prisma.nicovideoRegistrationRequest.count({
          where: { isChecked: false },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => NicovideoRegistrationRequestConnectionModel.fromPrisma(c));
  }) satisfies QueryResolvers["findUncheckedNicovideoRegistrationRequests"];