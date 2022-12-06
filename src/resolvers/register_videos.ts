import { GraphQLError } from "graphql";
import { In } from "typeorm";
import { ulid } from "ulid";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { Video } from "../db/entities/videos.js";
import { VideoSource } from "../db/entities/video_sources.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle } from "../db/entities/video_titles.js";
import { MutationResolvers } from "../graphql/resolvers.js";
import { VideoModel } from "../models/video.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";

export const registerVideo: MutationResolvers["registerVideo"] = async (_parent, { input }, _context, _info) => {
  const video = new Video();
  video.id = ulid();
  let titles: VideoTitle[] = [];
  const primaryTitle = new VideoTitle();
  primaryTitle.id = ulid();
  primaryTitle.title = input.primaryTitle;
  primaryTitle.video = video;
  primaryTitle.isPrimary = true;
  titles.push(primaryTitle);
  if (input.extraTitles != null) {
    for (const extraTitle of input.extraTitles) {
      let title = new VideoTitle();
      title.id = ulid();
      title.title = extraTitle;
      title.video = video;
      title.isPrimary = false;
      titles.push(title);
    }
  }
  const primaryThumbnail = new VideoThumbnail();
  primaryThumbnail.id = ulid();
  primaryThumbnail.imageUrl = input.primaryThumbnail;
  primaryThumbnail.video = video;
  primaryThumbnail.primary = true;
  const sources = input.sources.map((source) => {
    const s = new VideoSource();
    s.id = ulid();
    s.video = video;
    if (source.type !== "NICOVIDEO") {
      throw new Error("TODO: Add source type to VideoSource");
    }
    s.source = source.type;
    s.sourceVideoId = source.sourceId;
    return s;
  });

  const tags = await dataSource
    .getRepository(Tag)
    .findBy({ id: In(input.tags.map((t) => removeIDPrefix(ObjectType.Tag, t))) });
  if (tags.length !== input.tags.length) {
    throw new GraphQLError("Some of tag IDs are wrong");
  }
  const videoTags = tags.map((tag) => {
    const videoTag = new VideoTag();
    videoTag.id = ulid();
    videoTag.video = video;
    videoTag.tag = tag;
    return videoTag;
  });

  await dataSource.transaction(async (manager) => {
    await manager.getRepository(Video).insert(video);
    await manager.getRepository(VideoTitle).insert(titles);
    await manager.getRepository(VideoThumbnail).insert(primaryThumbnail);
    await manager.getRepository(VideoSource).insert(sources);
    await manager.getRepository(VideoTag).insert(videoTags);
  });

  video.titles = titles;
  video.thumbnails = [primaryThumbnail];
  video.sources = sources;

  return {
    video: new VideoModel(video),
  };
};
