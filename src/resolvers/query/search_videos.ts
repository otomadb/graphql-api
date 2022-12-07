import { DataSource, In, Like } from "typeorm";

import { VideoTitle } from "../../db/entities/video_titles.js";
import { Video } from "../../db/entities/videos.js";
import { VideoModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const searchVideos =
  ({ ds }: { ds: DataSource }): QueryResolvers["searchVideos"] =>
  async (_parent, { limit, query, skip }) => {
    const videoTitles = await ds
      .getRepository(VideoTitle)
      .createQueryBuilder("videoTitle")
      .where({ name: Like(`%${query}%`) })
      .leftJoinAndSelect("videoTitle.video", "videos")
      .distinctOn(["videoTitle.video.id"])
      .getMany();

    const videos = await ds.getRepository(Video).find({
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
