import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { TagParentEventModel } from "../TagParentEvent/model.js";
import { ResolverDeps } from "../types.js";

export const resolveTagParent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagParent", id),

    parent: ({ parentId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: parentId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", parentId);
        }),
    child: ({ childId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: childId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", childId);
        }),

    events: async ({ id: tagParentId }, { input }) => {
      const nodes = await prisma.tagParentEvent
        .findMany({
          where: { tagParentId },
          take: input.limit?.valueOf(),
          skip: input.skip.valueOf(),
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new TagParentEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["TagParent"]);
