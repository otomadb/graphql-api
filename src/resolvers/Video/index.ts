import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { ResolverDeps } from "../index.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { SemitagModel } from "../Semitag/model.js";
import { VideoEventModel } from "../VideoEvent/model.js";
import { resolveSimilarVideos } from "./similarVideos.js";
import { resolveTags } from "./tags.js";

export const resolveVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ({
    id: ({ id }): string => buildGqlId("Video", id),

    title: async ({ id: videoId }) => {
      const title = await prisma.videoTitle.findFirst({ where: { videoId, isPrimary: true } });
      if (!title) throw new GraphQLError(`primary title for video ${videoId} is not found`);

      return title.title;
    },
    titles: async ({ id: videoId }) => {
      const titles = await prisma.videoTitle.findMany({ where: { videoId } });
      return titles.map(({ title, isPrimary }) => ({
        title,
        primary: isPrimary,
      }));
    },

    thumbnailUrl: async ({ id: videoId }) => {
      const thumbnail = await prisma.videoThumbnail.findFirst({ where: { videoId, isPrimary: true } });

      if (!thumbnail) throw new GraphQLError(`primary thumbnail for video ${videoId} is not found`);
      return thumbnail.imageUrl;
    },
    thumbnails: async ({ id: videoId }) => {
      const thumbnails = await prisma.videoThumbnail.findMany({ where: { videoId } });
      return thumbnails.map((t) => ({ imageUrl: t.imageUrl, primary: t.isPrimary }));
    },

    tags: resolveTags({ prisma }),
    hasTag: async ({ id: videoId }, { id: tagGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { videoId, tagId: parseGqlID("Tag", tagGqlId) } } })
        .then((v) => !!v && !v.isRemoved),

    similarVideos: resolveSimilarVideos({ neo4j }),

    nicovideoSources: async ({ id: videoId }) =>
      prisma.nicovideoVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => new NicovideoVideoSourceModel(s))),

    semitags: ({ id: videoId }, { resolved }) =>
      prisma.semitag
        .findMany({ where: { videoId, isResolved: resolved?.valueOf() } })
        .then((semitags) => semitags.map((semitag) => new SemitagModel(semitag))),

    events: async ({ id: videoId }, { input }) => {
      const nodes = await prisma.videoEvent
        .findMany({
          where: { videoId },
          take: input.limit,
          skip: input.skip,
          orderBy: { id: "desc" },
        })
        .then((es) => es.map((e) => new VideoEventModel(e)));
      return { nodes };
    },
  } satisfies Resolvers["Video"]);
