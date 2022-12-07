import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Video } from "../../db/entities/videos.js";
import { VideoModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const getVideo =
  ({ ds }: { ds: DataSource }): QueryResolvers["video"] =>
  async (_parent, { id }) => {
    const video = await ds.getRepository(Video).findOne({
      where: { id: removeIDPrefix(ObjectType.Video, id) },
    });
    if (!video) throw new GraphQLError("Not Found");

    return new VideoModel(video);
  };
