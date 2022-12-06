import { GraphQLError } from "graphql";

import { dataSource } from "../../db/data-source.js";
import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { MylistModel, VideoModel } from "../../graphql/models.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../../utils/id.js";

export const resolveMylistRegistration: Resolvers["MylistRegistration"] = {
  id: ({ id }) => addIDPrefix(ObjectType.MylistRegistration, id),

  video: async ({ videoId }) => {
    const video = await dataSource.getRepository(Video).findOne({
      where: { id: removeIDPrefix(ObjectType.Video, videoId) },
    });
    if (!video) throw new GraphQLError("Not Found");

    return new VideoModel(video);
  },
  mylist: async ({ mylistId }) => {
    const mylist = await dataSource.getRepository(Mylist).findOne({
      where: { id: removeIDPrefix(ObjectType.Mylist, mylistId) },
    });
    if (!mylist) throw new GraphQLError("Not Found");

    return new MylistModel(mylist);
  },
};
