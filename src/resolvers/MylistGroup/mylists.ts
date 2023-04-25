import { GraphQLError } from "graphql";

import { isErr } from "../../utils/Result.js";
import { MylistGroupResolvers } from "../graphql.js";
import { MylistGroupMylistInclusionModel } from "../MylistGroupMylistInclusion/model.js";
import { parseOrderBy } from "../parseSortOrder.js";
import { ResolverDeps } from "../types.js";

export const resolveMylists = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id }, { input: { order: unparsedOrderBy, ...input } }, _ctx, info) => {
    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    const inclusions = await prisma.mylistGroupMylistInclsion.findMany({
      where: { group: { id } },
      take: input.limit,
      skip: input.skip,
      orderBy: orderBy.data,
    });
    const nodes = inclusions.map((i) => new MylistGroupMylistInclusionModel(i));
    return { nodes };
  }) satisfies MylistGroupResolvers["mylists"];
