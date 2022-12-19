import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource, In } from "typeorm";

import { NicovideoVideoSource } from "../../db/entities/nicovideo_source.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { VideoThumbnail } from "../../db/entities/video_thumbnails.js";
import { VideoTitle as VideoTitleEntity } from "../../db/entities/video_titles.js";
import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { calcVideoSimilarities } from "../../neo4j/video_similarities.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { TagModel } from "../tag/model.js";
import { VideoModel } from "./model.js";

export const resolveId = ({ id }: VideoModel) => addIDPrefix(ObjectType.Video, id);
export const resolveHistory = () => ({ nodes: [] });

export const resolveVideo = ({
  dataSource,
  neo4jDriver,
}: {
  dataSource: DataSource;
  neo4jDriver: Neo4jDriver;
}): Resolvers["Video"] => ({
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

  similarVideos: async ({ id: videoId }, { input }) => {
    const similarities = await calcVideoSimilarities(neo4jDriver)(videoId, { limit: input.limit });

    const items = await dataSource
      .getRepository(Video)
      .find({ where: { id: In(similarities.map(({ videoId }) => videoId)) } })
      .then((vs) =>
        similarities.map(({ videoId, score }) => {
          const video = vs.find((v) => v.id === videoId)!; // TODO: 危険
          return { video: new VideoModel(video), score };
        })
      );

    return { items };
  },

  nicovideoSources: async ({ id: videoId }) =>
    dataSource
      .getRepository(NicovideoVideoSource)
      .find({ where: { video: { id: videoId } }, relations: { video: true } })
      .then((ss) =>
        ss.map(({ id, sourceId, video }) => new NicovideoVideoSourceModel({ id, sourceId, videoId: video.id }))
      ),
});
