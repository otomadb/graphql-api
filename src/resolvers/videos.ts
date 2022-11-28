import { ulid } from "ulid";
import { dataSource } from "../db/data-source.js";
import { Video } from "../db/entities/videos.js";
import { VideoSource } from "../db/entities/video_sources.js";
import { VideoThumbnail } from "../db/entities/video_thumbnails.js";
import { VideoTitle } from "../db/entities/video_titles.js";
import { MutationResolvers } from "../graphql/resolvers.js";

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
  const sources = input.sources.map((source) => {
    const s = new VideoSource();
    s.id = ulid();
    s.video = video;
    if (source.type !== "NICOVIDEO") {
      throw new Error("TODO: Add source type to VideoSource");
    }
    s.videoId = source.sourceId;
    return s;
  });

  await dataSource.transaction(async (manager) => {
    await manager.getRepository(Video).insert(video);
    await manager.getRepository(VideoTitle).insert(titles);
    await manager.getRepository(VideoThumbnail).insert(primaryThumbnail);
    await manager.getRepository(VideoSource).insert(sources);
  });
  return {
    video: {
      id: "video:" + video.id,
      title: primaryTitle.title,
      titles: titles.map((t) => ({
        title: t.title,
        primary: t.isPrimary,
      })),
      thumbnailUrl: primaryThumbnail.imageUrl,
      thumbnails: [
        {
          imageUrl: primaryThumbnail.imageUrl,
          primary: true,
        },
      ],
      tags: [],
      hasTag: false,
      history: [],
      registeredAt: video.createdAt,
    },
  };
};
