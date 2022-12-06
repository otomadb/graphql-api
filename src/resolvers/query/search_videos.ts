import { In, Like } from "typeorm";

import { VideoModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { dataSource } from "../../db/data-source.js";
import { VideoTitle } from "../../db/entities/video_titles.js";
import { Video } from "../../db/entities/videos.js";

export const searchVideos: QueryResolvers["searchVideos"] = async (_parent, { limit, query, skip }) => {
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
