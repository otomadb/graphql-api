import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { MutationResolvers } from "../../graphql.js";
import { removeMylistRegistration as removeMylistRegistrationInNeo4j } from "../../neo4j/removeMylistRegistration.js";
import { parseGqlID } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const removeVideoFromMylist = ({
  dataSource: ds,
  neo4jDriver,
}: {
  dataSource: DataSource;
  neo4jDriver: Neo4jDriver;
}) =>
  (async (_, { input: { mylistId: mylistGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID("video", videoGqlId);
    const mylistId = parseGqlID("mylist", mylistGqlId);

    const repoMylistRegistration = ds.getRepository(MylistRegistration);

    const registration = await repoMylistRegistration.findOne({
      where: { video: { id: videoId }, mylist: { id: mylistId } },
      relations: { video: true, mylist: true },
    });
    if (!registration) throw new GraphQLError(`"video:${videoId}" is not registered in "mylist:${mylistId}"`);

    await repoMylistRegistration.remove(registration);

    await removeMylistRegistrationInNeo4j({ neo4jDriver })(registration);

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["removeVideoFromMylist"];
