import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { QueryResolvers } from "../../graphql.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";

export const findTags = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
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

    return { nodes: tags.map((t) => new TagModel(t)) };
  }) satisfies QueryResolvers["findTags"];
