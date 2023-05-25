import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagNameEventDTO } from "./dto.js";

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
        .then((es) => es.map((e) => new TagNameEventDTO(e)));
      return { nodes };
    },
  } satisfies Resolvers["TagName"]);
