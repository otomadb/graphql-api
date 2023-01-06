import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../../db/entities/mylist_registrations.js";
import { Mylist } from "../../../db/entities/mylists.js";
import { MutationResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { MylistModel } from "../../Mylist/model.js";
import { VideoModel } from "../../Video/model.js";

export const undoLikeVideoInNeo4j = async (
  neo4jDriver: Neo4jDriver,
  { mylistId, videoId }: { mylistId: string; videoId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
        MATCH (l:Mylist {id: $mylist_id })
        MATCH (v:Video {id: $video_id })
        MATCH (l)-[r:CONTAINS_VIDEO]->(v)
        DELETE r
        `,
      { mylist_id: mylistId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

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

    await undoLikeVideoInNeo4j(neo4jDriver, {
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
