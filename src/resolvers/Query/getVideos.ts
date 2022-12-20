import { DataSource } from "typeorm";

import { Video } from "../../db/entities/videos.js";
import { QueryResolvers } from "../../graphql.js";
import { VideoModel } from "../Video/model.js";

export const getVideos =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["videos"] =>
  async (_parent, { input }) => {
    const videos = await dataSource.getRepository(Video).find({
      take: input.limit,
      skip: input.skip,
      order: {
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
      },
    });

    return {
      nodes: videos.map((v) => new VideoModel(v)),
    };
  };
