import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { GraphQLError } from "graphql";

import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { schemaConnArgsAcceptAll } from "../schemas.js";
import { TagConnectionDTO } from "../Tag/TagConnection.dto.js";
import { MkResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkAbstractGroupResolver: MkResolver<"AbstractGroup", "prisma" | "logger"> = ({ prisma, logger }) => {
  return {
    keyword: ({ keyword }) => keyword,
    name: async ({ keyword }, { locale }) =>
      prisma.abstractGroupName
        .findUnique({ where: { groupKeyword_locale: { groupKeyword: keyword, locale } } })
        .then((d) => d?.name || keyword),
    belongingTags: async ({ keyword }, { input: { orderBy: unparsedOrderBy, ...unparsedConnArgs } }) => {
      const connArgs = schemaConnArgsAcceptAll.safeParse(unparsedConnArgs);
      if (!connArgs.success) {
        logger.error({ connArgs: unparsedConnArgs }, "Wrong connection args");
        throw new GraphQLError("Wrong connection args");
      }

      const orderBy = parseOrderBy(unparsedOrderBy);
      if (isErr(orderBy)) {
        logger.error({ orderBy: unparsedOrderBy }, "Wrong orderBy");
        throw new GraphQLError("Wrong orderBy");
      }

      return findManyCursorConnection(
        (args) =>
          prisma.tag.findMany({
            ...args,
            where: {
              disabled: false,
              AbstractGrouping: { some: { groupKeyword: keyword } },
            },
            orderBy: {
              videos: { _count: orderBy.data.taggedMads },
            },
          }),
        () =>
          prisma.tag.count({
            where: {
              disabled: false,
              AbstractGrouping: { some: { groupKeyword: keyword } },
            },
            orderBy: {
              videos: { _count: orderBy.data.taggedMads },
            },
          }),
        connArgs.data,
      ).then((tc) => TagConnectionDTO.fromPrisma(tc));
    },
  };
};
