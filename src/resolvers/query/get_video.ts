import { GraphQLError } from "graphql";

import { VideoModel } from "../../codegen/models.js";
import { QueryResolvers } from "../../codegen/resolvers.js";
import { dataSource } from "../../db/data-source.js";
import { Video } from "../../db/entities/videos.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const getVideo: QueryResolvers["video"] = async (_parent, { id }) => {
  const video = await dataSource.getRepository(Video).findOne({
    where: { id: removeIDPrefix(ObjectType.Video, id) },
  });
  if (!video) throw new GraphQLError("Not Found");

  return new VideoModel(video);
};
