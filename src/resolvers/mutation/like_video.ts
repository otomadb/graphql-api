import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { MylistRegistrationModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { addVideoToMylist as addVideoToMylistInNeo4j } from "../../neo4j/add_video_to_mylist.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const likeVideo =
  ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }): MutationResolvers["likeVideo"] =>
  async (_, { input: { videoId } }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const mylist = await dataSource
      .getRepository(Mylist)
      .findOne({ where: { holder: { id: user.id }, isLikeList: true }, relations: { holder: true } });
    if (!mylist) throw new GraphQLError(`Cannot find favorites list for user for "${user.id}"`);

    const video = await dataSource
      .getRepository(Video)
      .findOne({ where: { id: removeIDPrefix(ObjectType.Video, videoId) } });
    if (!video) throw new GraphQLError(`Cannot find video for "${videoId}"`);

    const registration = new MylistRegistration();
    registration.id = ulid();
    registration.mylist = mylist;
    registration.video = video;
    registration.note = null;
    await dataSource.getRepository(MylistRegistration).insert(registration);

    await addVideoToMylistInNeo4j(neo4jDriver)({
      mylistId: mylist.id,
      videoId: video.id,
    });

    return {
      registration: new MylistRegistrationModel({
        id: registration.id,
        note: registration.note,
        createdAt: registration.createdAt,
        updatedAt: registration.updatedAt,
        mylistId: registration.mylist.id,
        videoId: registration.video.id,
      }),
    };
  };
