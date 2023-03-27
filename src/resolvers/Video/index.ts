import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, parseGqlID } from "../id.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { SemitagModel } from "../Semitag/model.js";
import { ResolverDeps } from "../types.js";
import { VideoEventModel } from "../VideoEvent/model.js";
import { VideoThumbnailModel } from "../VideoThumbnail/model.js";
import { VideoTitleModel } from "../VideoTitle/model.js";
import { YoutubeVideoSourceModel } from "../YoutubeVideoSource/model.js";
import { resolveSimilarVideos as resolverVideoSimilarVideos } from "./similarVideos/resolver.js";
import { resolveTaggings } from "./taggings/resolver.js";

export const resolveVideo = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("Video", id),

    title: async ({ id: videoId }) => {
      const title = await prisma.videoTitle.findFirst({ where: { videoId, isPrimary: true } });
      if (!title) throw new GraphQLError(`primary title for video ${videoId} is not found`);

      return title.title;
    },
    titles: async ({ id: videoId }) =>
      prisma.videoTitle.findMany({ where: { videoId } }).then((vs) => vs.map((t) => new VideoTitleModel(t))),

    thumbnailUrl: async ({ id: videoId }) => {
      const thumbnail = await prisma.videoThumbnail.findFirst({ where: { videoId, isPrimary: true } });

      if (!thumbnail) throw new GraphQLError(`primary thumbnail for video ${videoId} is not found`);
      return thumbnail.imageUrl;
    },

    thumbnails: async ({ id: videoId }) =>
      prisma.videoThumbnail.findMany({ where: { videoId } }).then((vs) => vs.map((t) => new VideoThumbnailModel(t))),

    taggings: resolveTaggings({ prisma, logger }),

    hasTag: async ({ id: videoId }, { id: tagGqlId }) =>
      prisma.videoTag
        .findUnique({ where: { videoId_tagId: { videoId, tagId: parseGqlID("Tag", tagGqlId) } } })
        .then((v) => !!v && !v.isRemoved),

    similarVideos: resolverVideoSimilarVideos({ neo4j, logger }),

    nicovideoSources: async ({ id: videoId }) =>
      prisma.nicovideoVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => new NicovideoVideoSourceModel(s))),

    youtubeSources: async ({ id: videoId }) =>
      prisma.youtubeVideoSource
        .findMany({ where: { videoId } })
        .then((ss) => ss.map((s) => YoutubeVideoSourceModel.fromPrisma(s))),

    semitags: ({ id: videoId }, { checked }) =>
      prisma.semitag
        .findMany({ where: { videoId, isChecked: checked?.valueOf() } })
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

    isLiked: ({ id: videoId }, _args, { user }) => {
      if (!user) throw new GraphQLError("Not logged in");
      return prisma.mylistRegistration
        .findFirst({ where: { videoId, mylist: { holderId: user.id }, isRemoved: false } })
        .then((r) => !!r);
    },

    like: async ({ id: videoId }, _args, { user }) => {
      if (!user) return null;
      return prisma.mylistRegistration
        .findFirst({ where: { videoId, mylist: { holderId: user.id }, isRemoved: false } })
        .then((r) => MylistRegistrationModel.fromPrismaNullable(r));
    },
  } satisfies Resolvers["Video"]);
