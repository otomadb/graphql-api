import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { MylistRegistration } from "../../../db/entities/mylist_registrations.js";
import { MutationResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { MylistModel } from "../../Mylist/model.js";
import { VideoModel } from "../../Video/model.js";

export const removeMylistRegistrationInNeo4j = async (
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

    await removeMylistRegistrationInNeo4j(neo4jDriver, {
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["removeVideoFromMylist"];
