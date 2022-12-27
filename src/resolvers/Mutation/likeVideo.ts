import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { addVideoToMylist as addVideoToMylistInNeo4j } from "../../neo4j/add_video_to_mylist.js";
import { GraphQLNotFoundError, parseGqlID2 } from "../../utils/id.js";
import { MylistRegistrationModel } from "../MylistRegistration/model.js";

export const likeVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const videoId = parseGqlID2("video", videoGqlId);

    const registration = new MylistRegistration();
    registration.id = ulid();
    registration.note = null;

    await dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const repoMylist = manager.getRepository(Mylist);
      const repoMylistRegistration = manager.getRepository(MylistRegistration);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw GraphQLNotFoundError("video", videoGqlId);

      const mylist = await repoMylist.findOne({
        where: { holder: { id: user.id }, isLikeList: true },
        relations: { holder: true },
      });
      if (!mylist) throw new GraphQLError(`like list for user "${user.id}" is not found`); // TODO:

      registration.video = video;
      registration.mylist = mylist;

      await repoMylistRegistration.insert(registration);
    });

    await addVideoToMylistInNeo4j(neo4jDriver)({
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
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
  }) satisfies MutationResolvers["likeVideo"];
