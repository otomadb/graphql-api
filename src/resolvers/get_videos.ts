import { dataSource } from "../db/data-source.js";
import { Video } from "../db/entities/videos.js";
import { QueryResolvers } from "../graphql/resolvers.js";
import { VideoModel } from "../models/video.js";

export const getVideos: QueryResolvers["videos"] = async (_parent, { input }, _context, _info) => {
  const videos = await dataSource.getRepository(Video).find({
    take: input?.limit || 0,
    skip: input?.skip || 0,
    order: {
      createdAt: input?.order?.createdAt || undefined,
      updatedAt: input?.order?.updatedAt || undefined,
    },
  });

  return { nodes: videos.map((v) => new VideoModel(v)) };
};
