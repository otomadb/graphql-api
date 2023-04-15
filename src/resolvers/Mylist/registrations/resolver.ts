import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { MylistResolvers } from "../../graphql.js";
import { MylistRegistrationConnectionModel } from "../../MylistRegistrationConnection/model.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverMylistRegistrations = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async ({ id: mylistId }, { orderBy, ...unparsedConnectionArgs }, { currentUser: ctxUser }, info) => {
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
      logger.error(
        { path: info.path, args: { orderBy, ...unparsedConnectionArgs }, userId: ctxUser?.id },
        "Wrong args"
      );
      throw new GraphQLError("Wrong args");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.mylistRegistration.findMany({
          ...args,
          where: { mylistId },
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
        }),
      () =>
        prisma.mylistRegistration.count({
          where: { mylistId },
        }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => MylistRegistrationConnectionModel.fromPrisma(c));
  }) satisfies MylistResolvers["registrations"];
