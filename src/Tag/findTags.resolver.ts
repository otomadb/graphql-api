import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";

import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { schemaConnArgs } from "../schemas.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { TagConnectionDTO } from "./TagConnection.dto.js";

export const resolverFindTags: MkQueryResolver<"findTags", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (_parent, { input: { orderBy: unparsedOrderBy, ...unparsedConnArgs } }) => {
    const connArgs = schemaConnArgs.safeParse(unparsedConnArgs);
    if (!connArgs.success) {
      logger.error({ connArgs: unparsedConnArgs, error: connArgs.error }, "Wrong conn args");
      throw new GraphQLError("Wrong conn args");
    }

    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ orderBy: unparsedOrderBy, error: orderBy.error }, "Wrong orderBy");
      throw new GraphQLError("Wrong orderBy");
    }

    return findManyCursorConnection(
      (args) =>
        prisma.tag.findMany({
          ...args,
          where: {
            disabled: false,
          },
          orderBy: {
            videos: { _count: orderBy.data.taggedMads },
          },
        }),
      () =>
        prisma.tag.count({
          where: {
            disabled: false,
          },
          orderBy: {
            videos: { _count: orderBy.data.taggedMads },
          },
        }),
      connArgs.data,
    ).then((tc) => TagConnectionDTO.fromPrisma(tc));
  };
