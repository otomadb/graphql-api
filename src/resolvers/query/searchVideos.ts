import { GraphQLError } from "graphql";
import { DataSource, In, Like } from "typeorm";

import { VideoTitle } from "../../db/entities/video_titles.js";
import { Video } from "../../db/entities/videos.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { VideoModel } from "../video/model.js";

export const searchVideos =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["searchVideos"] =>
  async (_, { input }) => {
    const videoTitles = await dataSource
      .getRepository(VideoTitle)
      .createQueryBuilder("videoTitle")
      .where({ title: Like(`%${input.query}%`) })
      .leftJoinAndSelect("videoTitle.video", "videos")
      .distinctOn(["videoTitle.video.id"])
      .skip(input.skip)
      .limit(input.limit)
      .getMany();

    const videos = await dataSource.getRepository(Video).find({
      where: { id: In(videoTitles.map((t) => t.video.id)) },
    });

    return {
      result: videoTitles.map((t) => {
        const video = videos.find((v) => v.id === t.video.id);
        if (!video) throw new GraphQLError(`Data inconcistency is occuring for "video:${t.video.id}"`);
        return {
          matchedTitle: t.title,
          video: new VideoModel(video),
        };
      }),
    };
  };
