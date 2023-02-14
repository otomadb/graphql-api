import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../index.js";
import { TagNameEventModel } from "../TagNameEvent/model.js";

export const resolveTagName = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagName", id),
    events: async ({ id: tagNameId }, { input }) => {
      const nodes = await prisma.tagNameEvent
        .findMany({
          where: { tagNameId },
          take: input.limit?.valueOf(),
          skip: input.skip.valueOf(),
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new TagNameEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["TagName"]);
