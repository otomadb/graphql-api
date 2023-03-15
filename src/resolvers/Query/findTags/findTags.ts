import { QueryResolvers } from "../../graphql.js";
import { parseSortOrder } from "../../parseSortOrder.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";

export const findTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const tags = await prisma.tag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parseSortOrder(input.order?.createdAt),
        updatedAt: parseSortOrder(input.order?.updatedAt),
      },
      where: {
        ...(input.name && { names: { some: { name: input.name } } }),
        ...(input.parents && { parents: { some: { parentId: { in: input.parents } } } }),
        // ...(input.parents && { parents: { some: { id: { in: input.parents } } } }),
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  }) satisfies QueryResolvers["findTags"];
