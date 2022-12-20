import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { MutationResolvers } from "../../graphql.js";
import { removeVideoFromMylist as removeVideoFromMylistInNeo4j } from "../../neo4j/remove_video_from_mylist.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const removeVideoFromMylist =
  ({
    dataSource: ds,
    neo4jDriver,
  }: {
    dataSource: DataSource;
    neo4jDriver: Neo4jDriver;
  }): MutationResolvers["removeVideoFromMylist"] =>
  async (_, { input: { videoId, mylistId } }, { user }) => {
    if (!user) {
      throw new GraphQLError("required to sign in");
    }

    const repository = ds.getRepository(MylistRegistration);
    const registration = await repository.findOne({
      where: {
        video: { id: removeIDPrefix(ObjectType.Video, videoId) },
        mylist: { id: removeIDPrefix(ObjectType.Mylist, mylistId) },
      },
      relations: {
        video: true,
        mylist: true,
      },
    });
    if (!registration) throw new GraphQLError("Not Found");

    await repository.remove(registration);

    await removeVideoFromMylistInNeo4j(neo4jDriver)({
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  };
