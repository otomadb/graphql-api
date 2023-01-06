import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistRegistration } from "../../../db/entities/mylist_registrations.js";
import { Mylist } from "../../../db/entities/mylists.js";
import { Video } from "../../../db/entities/videos.js";
import { MutationResolvers } from "../../../graphql.js";
import { addMylistRegistration as addMylistRegistrationInNeo4j } from "../../../neo4j/addMylistRegistration.js";
import { GraphQLNotFoundError, parseGqlID } from "../../../utils/id.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";

export const likeVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const videoId = parseGqlID("video", videoGqlId);

    const registration = new MylistRegistration();
    registration.id = ulid();
    registration.note = null;

    await dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const repoMylist = manager.getRepository(Mylist);
      const repoMylistRegistration = manager.getRepository(MylistRegistration);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw GraphQLNotFoundError("video", videoId);

      const mylist = await repoMylist.findOne({
        where: { holder: { id: user.id }, isLikeList: true },
        relations: { holder: true },
      });
      if (!mylist) throw new GraphQLError(`like list for "${user.id}" is not found`); // TODO:

      registration.video = video;
      registration.mylist = mylist;

      await repoMylistRegistration.insert(registration);
    });

    await addMylistRegistrationInNeo4j({ neo4jDriver })(registration);

    return {
      registration: new MylistRegistrationModel(registration),
    };
  }) satisfies MutationResolvers["likeVideo"];
