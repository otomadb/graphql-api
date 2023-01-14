import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MylistRegistration } from "../../../db/entities/mylist_registrations.js";
import { Mylist } from "../../../db/entities/mylists.js";
import { User, UserRole } from "../../../db/entities/users.js";
import { Video } from "../../../db/entities/videos.js";
import { MutationLikeVideoArgs, MutationResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";

export const addMylistRegistrationInNeo4j = async (
  neo4jDriver: Neo4jDriver,
  { mylistId, videoId }: { videoId: string; mylistId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
        MERGE (l:Mylist {id: $mylist_id })
        MERGE (v:Video {id: $video_id })
        MERGE (l)-[r:CONTAINS_VIDEO]->(v)
        RETURN r
        `,
      { mylist_id: mylistId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const likeVideoScaffold =
  ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  async (_parent: unknown, { input: { videoId: videoGqlId } }: MutationLikeVideoArgs, { user }: { user: User }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const videoId = parseGqlID("Video", videoGqlId);

    const registration = new MylistRegistration();
    registration.id = ulid();
    registration.note = null;

    await dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const repoMylist = manager.getRepository(Mylist);
      const repoMylistRegistration = manager.getRepository(MylistRegistration);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw new GraphQLNotExistsInDBError("Video", videoId);

      const mylist = await repoMylist.findOne({
        where: { holder: { id: user.id }, isLikeList: true },
        relations: { holder: true },
      });
      if (!mylist) throw new GraphQLError(`like list for "${user.id}" is not found`); // TODO:

      registration.video = video;
      registration.mylist = mylist;

      await repoMylistRegistration.insert(registration);
    });

    await addMylistRegistrationInNeo4j(neo4jDriver, {
      videoId: registration.video.id,
      mylistId: registration.mylist.id,
    });

    return {
      registration: new MylistRegistrationModel(registration),
    };
  };

export const likeVideo = (inject: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  checkAuth(UserRole.NORMAL, likeVideoScaffold(inject)) satisfies MutationResolvers["likeVideo"];
