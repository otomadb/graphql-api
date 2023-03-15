import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { TagEventModel } from "../TagEvent/model.js";
import { TagNameModel } from "../TagName/model.js";
import { ResolverDeps } from "../types.js";
import { resolverChildren } from "./children/resolver.js";
import { TagModel } from "./model.js";
import { resolverParents } from "./parents/resolver.js";
import { resolvePseudoType } from "./pseudoType.js";
import { resolveTaggedVideos } from "./taggedVideos/resolver.js";
import { resolveTagType } from "./type/resolver.js";

export const resolveTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("Tag", id),
    type: resolveTagType({ prisma }),
    pseudoType: resolvePseudoType({ prisma }),
    meaningless: ({ isCategoryTag: categoryTag }) => categoryTag,

    names: async ({ id: tagId }, { primary }) =>
      prisma.tagName
        .findMany({ where: { tag: { id: tagId }, isPrimary: primary?.valueOf() } })
        .then((v) => v.map((n) => new TagNameModel(n))),
    name: async ({ id: tagId }) => {
      const name = await prisma.tagName.findFirst({ where: { tagId } });
      if (!name) throw new GraphQLError(`primary name for tag ${tagId} is not found`);
      return name.name;
    },

    parents: resolverParents({ prisma, logger }),

    explicitParent: async ({ id: tagId }) => {
      const rel = await prisma.tagParent.findFirst({
        where: { child: { id: tagId }, isExplicit: true },
        include: { parent: true },
      });
      if (!rel) return null;
      return new TagModel(rel.parent);
    },
    children: resolverChildren({ prisma, logger }),

    taggedVideos: resolveTaggedVideos({ prisma, logger }),

    canTagTo: async ({ id: tagId }, { videoId: videoGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { tagId, videoId: parseGqlID("Video", videoGqlId) } } })
        .then((v) => !v || v.isRemoved),

    events: async ({ id: tagId }, { input }) => {
      const nodes = await prisma.tagEvent
        .findMany({
          where: { tagId },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new TagEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["Tag"]);
