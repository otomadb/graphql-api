import { parsePrismaOrder } from "../../../utils/parsePrismaOrder.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const findTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const tags = await prisma.tag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parsePrismaOrder(input.order?.createdAt),
        updatedAt: parsePrismaOrder(input.order?.updatedAt),
      },
      where: {
        ...(input.name && { names: { some: { name: input.name } } }),
        ...(input.parents && { parents: { some: { parentId: { in: input.parents } } } }),
        // ...(input.parents && { parents: { some: { id: { in: input.parents } } } }),
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  }) satisfies QueryResolvers["findTags"];
