import { GraphQLError } from "graphql";

import { QueryResolvers } from "../resolvers/graphql.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { isErr } from "../utils/Result.js";
import { TagDTO } from "./dto.js";

export const resolverFindTags = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { order: unparsedOrderBy, ...input } }, _ctx, info) => {
    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    const tags = await prisma.tag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: orderBy.data,
      where: {
        ...(input.name && { names: { some: { name: input.name } } }),
        ...(input.parents && { parents: { some: { parentId: { in: input.parents } } } }),
        // ...(input.parents && { parents: { some: { id: { in: input.parents } } } }),
      },
    });

    return { nodes: tags.map((t) => new TagDTO(t)) };
  }) satisfies QueryResolvers["findTags"];
