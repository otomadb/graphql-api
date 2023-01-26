import { QueryResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const findTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const tags = await prisma.tag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        // TODO: Prsima
        createdAt: "asc",
      },
      where: {
        ...(input.name && { names: { some: { name: input.name } } }),
        ...(input.parents && { parents: { some: { parentId: { in: input.parents } } } }),
        // ...(input.parents && { parents: { some: { id: { in: input.parents } } } }),
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  }) satisfies QueryResolvers["findTags"];
