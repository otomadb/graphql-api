import { DataSource } from "typeorm";

import { Video } from "../../db/entities/videos.js";
import { VideoModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const getVideos =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["videos"] =>
  async (_parent, { input }) => {
    const videos = await dataSource.getRepository(Video).find({
      take: input.limit || 0,
      skip: input.skip || 0,
      order: {
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
      },
    });

    return {
      nodes: videos.map((v) => new VideoModel(v)),
    };
  };
