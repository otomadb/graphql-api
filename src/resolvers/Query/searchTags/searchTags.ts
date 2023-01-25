import { QueryResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const searchTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input }) => {
    const tags = await prisma.tagName.findMany({
      where: { name: { contains: input.query } },
      distinct: "tagId",
      include: { tag: true },
      skip: input.skip || undefined,
      take: input.limit || undefined,
    });
    return {
      items: tags.map((t) => {
        return {
          matchedName: t.name,
          tag: new TagModel(t.tag),
        };
      }),
    };
  }) satisfies QueryResolvers["searchTags"];
