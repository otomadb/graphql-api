import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MylistRegistration } from "../../../db/entities/mylist_registrations.js";
import { Mylist } from "../../../db/entities/mylists.js";
import { UserRole } from "../../../db/entities/users.js";
import { Video } from "../../../db/entities/videos.js";
import { MutationResolvers } from "../../../graphql.js";
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

export const addVideoToMylist = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  checkAuth(
    UserRole.NORMAL,
    async (_parent, { input: { mylistId: mylistGqlId, note, videoId: videoGqlId } }, { user }) => {
      if (!user) throw new GraphQLError("need to authenticate");

      const mylistId = parseGqlID("Mylist", mylistGqlId);
      const videoId = parseGqlID("Video", videoGqlId);

      const registration = new MylistRegistration();
      registration.id = ulid();

      await dataSource.transaction(async (manager) => {
        const repoVideo = manager.getRepository(Video);
        const repoMylist = manager.getRepository(Mylist);
        const repoRegistration = manager.getRepository(MylistRegistration);

        const video = await repoVideo.findOne({ where: { id: videoId } });
        if (!video) throw new GraphQLNotExistsInDBError("Video", videoId);

        const mylist = await repoMylist.findOne({ where: { id: mylistId }, relations: { holder: true } });
        if (!mylist) throw new GraphQLNotExistsInDBError("Mylist", mylistId);
        if (mylist.holder.id !== user.id) throw new GraphQLError(`mylist "${mylistGqlId}" is not holded by you`);

        if (await repoRegistration.findOneBy({ mylist: { id: mylistId }, video: { id: videoId } }))
          throw new GraphQLError(`"${videoGqlId}" is already registered in "${mylistGqlId}"`);

        registration.video = video;
        registration.mylist = mylist;
        registration.note = note ?? null;

        await repoRegistration.insert(registration);
      });

      await addMylistRegistrationInNeo4j(neo4jDriver, {
        videoId: registration.video.id,
        mylistId: registration.mylist.id,
      });

      return {
        registration: new MylistRegistrationModel(registration),
      };
    }
  ) satisfies MutationResolvers["addVideoToMylist"];
