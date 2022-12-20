import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistRegistration = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }) => addIDPrefix(ObjectType.MylistRegistration, id),

    video: async ({ videoId }) => {
      const video = await dataSource.getRepository(Video).findOne({
        where: { id: (ObjectType.Video, videoId) },
      });
      if (!video) throw new GraphQLError("Not Found");

      return new VideoModel(video);
    },
    mylist: async ({ mylistId }) => {
      const mylist = await dataSource.getRepository(Mylist).findOne({
        where: { id: (ObjectType.Mylist, mylistId) },
      });
      if (!mylist) throw new GraphQLError("Not Found");

      return new MylistModel(mylist);
    },
  } satisfies Resolvers["MylistRegistration"]);
