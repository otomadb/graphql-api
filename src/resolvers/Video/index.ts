import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { NicovideoVideoSource } from "../../db/entities/nicovideo_video_sources.js";
import { Semitag } from "../../db/entities/semitags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { VideoThumbnail } from "../../db/entities/video_thumbnails.js";
import { VideoTitle as VideoTitleEntity } from "../../db/entities/video_titles.js";
import { Resolvers, VideoResolvers } from "../../graphql.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { SemitagModel } from "../Semitag/model.js";
import { TagModel } from "../Tag/model.js";
import { VideoModel } from "./model.js";
import { resolveSimilarVideos } from "./similarVideos.js";

export const resolveId = (({ id }: VideoModel) => addIDPrefix(ObjectType.Video, id)) satisfies VideoResolvers["id"];
export const resolveHistory = (() => ({ nodes: [] })) satisfies VideoResolvers["history"];

export const resolveVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  ({
    id: resolveId,

    title: async ({ id: videoId }) => {
      const title = await dataSource
        .getRepository(VideoTitleEntity)
        .findOne({ where: { video: { id: videoId }, isPrimary: true } });
      if (!title) throw new GraphQLError(`primary title for video ${videoId} is not found`);

      return title.title;
    },
    titles: async ({ id: videoId }) => {
      const titles = await dataSource.getRepository(VideoTitleEntity).find({ where: { video: { id: videoId } } });
      return titles.map((t) => ({
        title: t.title,
        primary: t.isPrimary,
      }));
    },

    thumbnails: async ({ id: videoId }) => {
      const thumbnails = await dataSource.getRepository(VideoThumbnail).find({ where: { video: { id: videoId } } });
      return thumbnails.map((t) => ({ imageUrl: t.imageUrl, primary: t.primary }));
    },
    thumbnailUrl: async ({ id: videoId }) => {
      const thumbnail = await dataSource
        .getRepository(VideoThumbnail)
        .findOne({ where: { video: { id: videoId }, primary: true } });

      if (!thumbnail) throw new GraphQLError(`primary thumbnail for video ${videoId} is not found`);
      return thumbnail.imageUrl;
    },

    tags: async ({ id: videoId }) => {
      const tags = await dataSource.getRepository(VideoTag).find({
        where: { video: { id: videoId } },
        relations: {
          tag: true,
        },
      });
      return tags.map(({ tag }) => new TagModel(tag));
    },
    hasTag: async ({ id: videoId }, { id: tagId }) => {
      return await dataSource
        .getRepository(VideoTag)
        .findOne({ where: { video: { id: videoId }, tag: { id: tagId } } })
        .then((v) => !!v);
    },

    history: resolveHistory,

    similarVideos: resolveSimilarVideos({ neo4jDriver }),

    nicovideoSources: async ({ id: videoId }) =>
      dataSource
        .getRepository(NicovideoVideoSource)
        .find({ where: { video: { id: videoId } }, relations: { video: true } })
        .then((ss) =>
          ss.map(({ id, sourceId, video }) => new NicovideoVideoSourceModel({ id, sourceId, videoId: video.id }))
        ),

    semitags: ({ id: videoId }, { resolved }) =>
      dataSource
        .getRepository(Semitag)
        .find({
          where: {
            video: { id: videoId },
            resolved: resolved?.valueOf(),
          },
        })
        .then((semitags) => semitags.map((semitag) => new SemitagModel(semitag))),
  } satisfies Resolvers["Video"]);
