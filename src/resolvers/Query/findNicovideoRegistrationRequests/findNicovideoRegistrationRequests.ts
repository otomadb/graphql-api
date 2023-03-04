import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";
import z from "zod";

import { cursorOptions } from "../../connection.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoRegistrationRequestConnectionModel } from "../../NicovideoRegistrationRequestConnection/model.js";
import { parseSortOrder as parseOrderBy } from "../../parseSortOrder.js";

export const findNicovideoRegistrationRequests = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { orderBy, checked, ...unparsedConnectionArgs }, { user: ctxUser }, info) => {
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
        prisma.nicovideoRegistrationRequest.findMany({
          where: { isChecked: checked?.valueOf() },
          orderBy: { createdAt: parseOrderBy(orderBy.createdAt) },
          ...args,
        }),
      () => prisma.nicovideoRegistrationRequest.count({ where: { isChecked: checked?.valueOf() } }),
      connectionArgs.data,
      { resolveInfo: info, ...cursorOptions }
    ).then((c) => NicovideoRegistrationRequestConnectionModel.fromPrisma(c));
  }) satisfies QueryResolvers["findNicovideoRegistrationRequests"];
