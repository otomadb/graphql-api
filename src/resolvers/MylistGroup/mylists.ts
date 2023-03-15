import { MylistGroupResolvers } from "../graphql.js";
import { MylistGroupMylistInclusionModel } from "../MylistGroupMylistInclusion/model.js";
import { parseSortOrder } from "../parseSortOrder.js";
import { ResolverDeps } from "../types.js";

export const resolveMylists = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id }, { input }) => {
    const inclusions = await prisma.mylistGroupMylistInclsion.findMany({
      where: { group: { id } },
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parseSortOrder(input.order?.createdAt),
        updatedAt: parseSortOrder(input.order?.updatedAt),
      },
    });
    const nodes = inclusions.map((i) => new MylistGroupMylistInclusionModel(i));
    return { nodes };
  }) satisfies MylistGroupResolvers["mylists"];
