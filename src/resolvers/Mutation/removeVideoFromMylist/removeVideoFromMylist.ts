import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
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

export const removeVideoFromMylist = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  checkAuth(UserRole.NORMAL, async (_, { input: { mylistId: mylistGqlId, videoId: videoGqlId } }, { user }) => {
    const videoId = parseGqlID("Video", videoGqlId);
    const mylistId = parseGqlID("Mylist", mylistGqlId);

    if ((await prisma.mylist.findUniqueOrThrow({ where: { id: mylistId } })).holderId !== user.id)
      throw new GraphQLError("This mylist is not yours");

    const registration = await prisma.mylistRegistration.delete({
      where: { mylistId_videoId: { videoId, mylistId } },
      include: { video: true, mylist: true },
    });

    await removeMylistRegistrationInNeo4j(neo4j, {
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["removeVideoFromMylist"];
