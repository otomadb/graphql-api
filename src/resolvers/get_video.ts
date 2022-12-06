import { GraphQLError } from "graphql";

import { dataSource } from "../db/data-source.js";
import { Video } from "../db/entities/videos.js";
import { QueryResolvers } from "../graphql/resolvers.js";
import { VideoModel } from "../models/video.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";

export const getVideo: QueryResolvers["video"] = async (_parent, { id }, _context, _info) => {
  const video = await dataSource.getRepository(Video).findOne({
    where: { id: removeIDPrefix(ObjectType.Video, id) },
  });
  if (!video) throw new GraphQLError("Not Found");

  return new VideoModel(video);
};
