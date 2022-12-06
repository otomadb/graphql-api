import { GraphQLError } from "graphql";

import { Resolvers, VideoResolvers } from "~/codegen/resolvers.js";
import { dataSource } from "~/db/data-source.js";
import { VideoTag } from "~/db/entities/video_tags.js";
import { VideoThumbnail } from "~/db/entities/video_thumbnails.js";
import { VideoTitle as VideoTitleEntity } from "~/db/entities/video_titles.js";
import { addIDPrefix, ObjectType } from "~/utils/id.js";

export const resolveId: VideoResolvers["id"] = ({ id }) => addIDPrefix(ObjectType.Video, id);

export const resolveHistory: VideoResolvers["history"] = () => [];

export const resolveTitles: VideoResolvers["titles"] = async ({ id: videoId }) => {
  const titles = await dataSource.getRepository(VideoTitleEntity).find({ where: { video: { id: videoId } } });
  return titles.map((t) => ({
    title: t.title,
    primary: t.isPrimary,
  }));
};

export const resolveTitle: VideoResolvers["title"] = async ({ id: videoId }) => {
  const title = await dataSource
    .getRepository(VideoTitleEntity)
    .findOne({ where: { video: { id: videoId }, isPrimary: true } });
  if (!title) throw new GraphQLError(`primary title for video ${videoId} is not found`);

  return title.title;
};

export const resolveThumbnails: VideoResolvers["thumbnails"] = async ({ id: videoId }) => {
  const thumbnails = await dataSource.getRepository(VideoThumbnail).find({ where: { video: { id: videoId } } });
  return thumbnails.map((t) => ({ imageUrl: t.imageUrl, primary: t.primary }));
};

export const resolveThumbnail: VideoResolvers["thumbnailUrl"] = async ({ id: videoId }) => {
  const thumbnail = await dataSource
    .getRepository(VideoThumbnail)
    .findOne({ where: { video: { id: videoId }, primary: true } });

  if (!thumbnail) throw new GraphQLError(`primary thumbnail for video ${videoId} is not found`);
  return thumbnail.imageUrl;
};

export const resolveTags: VideoResolvers["tags"] = async ({ id: videoId }) => {
  const tags = await dataSource.getRepository(VideoTag).find({
    where: { video: { id: videoId } },
    relations: {
      tag: true,
    },
  });
  return tags.map(({ tag }) => ({ id: tag.id }));
};

export const resolveHasTag: VideoResolvers["hasTag"] = async ({ id: videoId }, { id: tagId }) => {
  return await dataSource
    .getRepository(VideoTag)
    .findOne({ where: { video: { id: videoId }, tag: { id: tagId } } })
    .then((v) => !!v);
};

export const resolverVideo: Resolvers["Video"] = {
  id: resolveId,
  title: resolveTitle,
  titles: resolveTitles,
  thumbnails: resolveThumbnails,
  thumbnailUrl: resolveThumbnail,
  tags: resolveTags,
  hasTag: resolveHasTag,
  history: resolveHistory,
};
