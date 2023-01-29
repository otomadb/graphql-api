import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { checkAuth } from "../../../auth/checkAuth.js";
import { parseGqlID } from "../../../utils/id.js";
import { MutationResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
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

export const addVideoToMylist = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  checkAuth(
    UserRole.NORMAL,
    async (_parent, { input: { mylistId: mylistGqlId, note, videoId: videoGqlId } }, { user }) => {
      const mylistId = parseGqlID("Mylist", mylistGqlId);
      const videoId = parseGqlID("Video", videoGqlId);

      if ((await prisma.mylist.findUniqueOrThrow({ where: { id: mylistId } })).holderId !== user.id)
        throw new GraphQLError(`mylist "${mylistGqlId}" is not holded by you`);

      const registration = await prisma.mylistRegistration.create({
        data: { videoId, mylistId, note },
        include: { video: true, mylist: true },
      });

      await addMylistRegistrationInNeo4j(neo4j, {
        videoId: registration.video.id,
        mylistId: registration.mylist.id,
      });

      return {
        registration: new MylistRegistrationModel(registration),
      };
    }
  ) satisfies MutationResolvers["addVideoToMylist"];
