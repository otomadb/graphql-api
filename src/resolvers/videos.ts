import { GraphQLError } from "graphql";
import { In, Like } from "typeorm";
import { ulid } from "ulid";

import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { VideoSource } from "../db/entities/video_sources.js";
import { VideoTag } from "../db/entities/video_tags.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle } from "../db/entities/video_titles.js";
import { Video } from "../db/entities/videos.js";
import { MutationResolvers, QueryResolvers } from "../graphql/resolvers.js";
import { TagModel } from "../models/tag.js";
import { VideoModel } from "../models/video.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../utils/id.js";
import { userEntityToGraphQLType } from "./users.js";

export const video: QueryResolvers["video"] = async (_parent, { id }, _context, _info) => {
  const video = await dataSource.getRepository(Video).findOne({
    where: { id: removeIDPrefix(ObjectType.Video, id) },
  });
  if (!video) throw new GraphQLError("Not Found");

  return new VideoModel(video);
};

export const videos: QueryResolvers["videos"] = async (_parent, { input }, _context, _info) => {
  const videos = await dataSource.getRepository(Video).find({
    take: input?.limit || 0,
    skip: input?.skip || 0,
    order:   {
          createdAt: input?.order?.createdAt || undefined,
          updatedAt: input?.order?.updatedAt || undefined,
        }
  });

  return { nodes: videos.map((v) => new VideoModel(v)) };
};

export const registerVideo: MutationResolvers["registerVideo"] = async (_parent, { input }, _context, _info) => {
  const video = new Video();
  video.id = ulid();
  const titles: VideoTitle[] = [];
  const primaryTitle = new VideoTitle();
  primaryTitle.id = ulid();
  primaryTitle.title = input.primaryTitle;
  primaryTitle.video = video;
  primaryTitle.isPrimary = true;
  titles.push(primaryTitle);
  if (input.extraTitles) {
    for (const extraTitle of input.extraTitles) {
      const title = new VideoTitle();
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

export const searchVideos: QueryResolvers["searchVideos"] = async (
  _parent,
  { limit, query, skip },
  _context,
  _info
) => {
  const videoTitles = await dataSource
    .getRepository(VideoTitle)
    .createQueryBuilder("videoTitle")
    .where({ name: Like(`%${query}%`) })
    .leftJoinAndSelect("videoTitle.video", "videos")
    .distinctOn(["videoTitle.video.id"])
    .getMany();

  const videos = await dataSource.getRepository(Video).find({
    where: { id: In(videoTitles.map((t) => t.video.id)) },
  });

  return {
    result: videoTitles.map((t) => {
      const video = videos.find((v) => v.id === t.video.id);
      if (!video) throw new Error(`Failed to find tag ${t.video.id}`);
      return {
        matchedTitle: t.title,
        video: new VideoModel(video),
      };
    }),
  };
};

export const tagVideo: MutationResolvers["tagVideo"] = async (
  _parent,
  { input: { tagId, videoId } },
  { user },
  _info
) => {
  if (!user) {
    throw new GraphQLError("required to sign in");
  }

  const video = await dataSource.getRepository(Video).findOne({
    where: { id: removeIDPrefix(ObjectType.Video, videoId) },
  });
  if (video === null) throw new GraphQLError("Video Not Found");
  const tag = await dataSource.getRepository(Tag).findOne({
    where: { id: removeIDPrefix(ObjectType.Tag, tagId) },
  });
  if (tag === null) throw new GraphQLError("Tag Not Found");
  const videoTag = new VideoTag();
  videoTag.id = ulid();
  videoTag.video = video;
  videoTag.tag = tag;
  await dataSource.getRepository(VideoTag).insert(videoTag);

  return {
    createdAt: new Date(),
    id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
    tag: new TagModel(tag),
    user: userEntityToGraphQLType(user),
    video: new VideoModel(video),
  };
};

export const untagVideo: MutationResolvers["untagVideo"] = async (
  _parent,
  { input: { tagId, videoId } },
  { user },
  _info
) => {
  if (!user) {
    throw new GraphQLError("required to sign in");
  }

  const repository = dataSource.getRepository(VideoTag);

  const videoTag = await repository.findOne({
    relations: {
      tag: true,
      video: true,
    },
    where: {
      video: { id: removeIDPrefix(ObjectType.Video, videoId) },
      tag: { id: removeIDPrefix(ObjectType.Tag, tagId) },
    },
  });
  if (!videoTag) {
    throw new GraphQLError("Not Found");
  }

  await repository.remove(videoTag);

  return {
    createdAt: new Date(),
    id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
    tag: new TagModel(videoTag.tag),
    user: userEntityToGraphQLType(user),
    video: new VideoModel(videoTag.video),
  };
};
