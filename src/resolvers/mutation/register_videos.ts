import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource, In } from "typeorm";
import { ulid } from "ulid";

import { NicovideoSource } from "../../db/entities/nicovideo_source.js";
import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { VideoThumbnail } from "../../db/entities/video_thumbnails.js";
import { VideoTitle } from "../../db/entities/video_titles.js";
import { Video } from "../../db/entities/videos.js";
import { VideoModel } from "../../graphql/models.js";
import { MutationResolvers, RegisterVideoInputSourceType } from "../../graphql/resolvers.js";
import { registerVideo as registerVideoInNeo4j } from "../../neo4j/register_video.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const isValidNicovideoSourceId = (id: string): boolean => /[a-z]{2}\d+/.test(id);

export const registerVideo =
  ({
    dataSource,
    neo4jDriver,
  }: {
    dataSource: DataSource;
    neo4jDriver: Neo4jDriver;
  }): MutationResolvers["registerVideo"] =>
  async (_parent, { input }) => {
    // validity check
    const nicovideoSourceIds = input.sources
      .filter((v) => v.type === RegisterVideoInputSourceType.Nicovideo)
      .map(({ sourceId }) => sourceId.toLocaleLowerCase());

    for (const id of nicovideoSourceIds) {
      if (!isValidNicovideoSourceId(id)) throw new GraphQLError(`"${id}" is invalid source id for niconico source`);
    }

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

    const nicovideoSources = nicovideoSourceIds.map((id) => {
      const s = new NicovideoSource();
      s.id = ulid();
      s.video = video;
      s.sourceId = id.toLowerCase();
      return s;
    });

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Video).insert(video);
      await manager.getRepository(VideoTitle).insert(titles);
      await manager.getRepository(VideoThumbnail).insert(primaryThumbnail);
      await manager.getRepository(VideoTag).insert(videoTags);
      await manager.getRepository(NicovideoSource).insert(nicovideoSources);
    });

    await registerVideoInNeo4j(neo4jDriver)(video.id, { tagIds: tags.map(({ id }) => id) });

    return {
      video: new VideoModel(video),
    };
  };
