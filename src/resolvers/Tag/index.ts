import { GraphQLError } from "graphql";

import { Resolvers, TagType } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { ResolverDeps } from "../index.js";
import { VideoModel } from "../Video/model.js";
import { TagModel } from "./model.js";
import { resolvePseudoType } from "./pseudoType.js";

export const resolveTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("Tag", id),
    type: () => TagType.Material,
    pseudoType: resolvePseudoType({ prisma }),

    names: async ({ id: tagId }) => {
      const names = await prisma.tagName.findMany({
        where: { tag: { id: tagId } },
      });
      return names.map((n) => ({
        name: n.name,
        primary: n.isPrimary,
      }));
    },
    name: async ({ id: tagId }) => {
      const name = await prisma.tagName.findFirst({ where: { tagId } });
      if (!name) throw new GraphQLError(`primary name for tag ${tagId} is not found`);
      return name.name;
    },

    parents: async ({ id: tagId }, { meaningless }) => {
      const rel = await prisma.tagParent.findMany({
        where: {
          child: { id: tagId },
          parent: { meaningless: meaningless || undefined },
        },
        include: {
          parent: true,
        },
      });
      return rel.map(({ parent, isExplicit }) => ({
        tag: new TagModel(parent),
        explicit: isExplicit,
      }));
    },

    explicitParent: async ({ id: tagId }) => {
      const rel = await prisma.tagParent.findFirst({
        where: { child: { id: tagId }, isExplicit: true },
        include: { parent: true },
      });
      if (!rel) return null;
      return new TagModel(rel.parent);
    },

    taggedVideos: async ({ id: tagId }) => {
      const videoTags = await prisma.videoTag.findMany({
        where: { tag: { id: tagId } },
        include: { video: true },
      });
      return videoTags.map(({ video }) => new VideoModel(video));
    },

    canTagTo: async ({ id: tagId }, { videoId: videoGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { tagId, videoId: parseGqlID("Video", videoGqlId) } } })
        .then((v) => !v || v.isRemoved),
  } satisfies Resolvers["Tag"]);
