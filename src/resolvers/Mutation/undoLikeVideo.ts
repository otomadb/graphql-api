import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist } from "../../db/entities/mylists.js";
import { MutationResolvers } from "../../graphql.js";
import { removeVideoFromMylist as removeVideoFromMylistInNeo4j } from "../../neo4j/remove_video_from_mylist.js";
import { parseGqlID } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const undoLikeVideo = ({ dataSource: ds, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID("video", videoGqlId);

    const repoMylist = ds.getRepository(Mylist);
    const repoMylistRegistration = ds.getRepository(MylistRegistration);

    const mylist = await repoMylist.findOne({
      where: { holder: { id: user.id }, isLikeList: true },
      relations: { holder: true },
    });
    if (!mylist) throw new GraphQLError(`like list for "${user.id}" is not found`); // TODO:

    const registration = await repoMylistRegistration.findOne({
      where: { video: { id: videoId }, mylist: { id: mylist.id } },
      relations: { video: true, mylist: true },
    });
    if (!registration) throw new GraphQLError(`"video:${videoId}" is not registered in "mylist:${mylist.id}"`);

    await repoMylistRegistration.remove(registration);

    await removeVideoFromMylistInNeo4j(neo4jDriver)({
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
