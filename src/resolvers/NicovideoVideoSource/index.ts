import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql.js";
import { buildGqlId } from "../../utils/id.js";
import { VideoModel } from "../Video/model.js";

export const resolveNicovideoVideoSource = ({
  dataSource,
}: {
  dataSource: DataSource;
}): Resolvers["NicovideoVideoSource"] => ({
  id: ({ id }) => buildGqlId("nicovideoVideoSource", id),
  url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
  video: async ({ videoId }) => {
    const video = await dataSource.getRepository(Video).findOne({ where: { id: videoId } });
    if (!video) throw new GraphQLError(`Video cannot find with id "${videoId}"`);
    return new VideoModel(video);
  },
});
