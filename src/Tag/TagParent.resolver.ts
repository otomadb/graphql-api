import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO, TagParentEventDTO } from "./dto.js";

export const resolveTagParent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagParent", id),

    parent: ({ parentId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: parentId } })
        .then((v) => new TagDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", parentId);
        }),
    child: ({ childId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: childId } })
        .then((v) => new TagDTO(v))
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
        .then((es) => es.map((e) => new TagParentEventDTO(e)));
      return { nodes };
    },
  } satisfies Resolvers["TagParent"]);
