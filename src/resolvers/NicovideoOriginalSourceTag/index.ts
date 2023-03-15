import { Resolvers } from "../graphql.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";

export const resolveNicovideoOriginalSourceTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    searchTags: async ({ name }, { input }) => {
      const tags = await prisma.tagName.findMany({
        where: { name: { contains: name } },
        distinct: "tagId",
        include: { tag: true },
        skip: input.skip.valueOf(),
        take: input.limit.valueOf(),
      });
      return {
        items: tags.map((t) => {
          return {
            tag: new TagModel(t.tag),
          };
        }),
      };
    },
  } satisfies Resolvers["NicovideoOriginalSourceTag"]);
