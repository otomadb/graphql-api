import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Video } from "../../../db/entities/videos.js";
import { QueryResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { VideoModel } from "../../Video/model.js";

export const video = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id }) => {
    const video = await dataSource.getRepository(Video).findOne({
      where: { id: parseGqlID("video", id) },
    });
    if (!video) throw new GraphQLError("Not Found");

    return new VideoModel(video);
  }) satisfies QueryResolvers["video"];
