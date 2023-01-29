import { UserRole } from "@prisma/client";
import { GraphQLError } from "graphql";

import { ensureContextUser } from "../../ensureContextUser.js";
import { MutationResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";
import { VideoModel } from "../../Video/model.js";

export const undoLikeVideoInNeo4j = async (
  neo4j: ResolverDeps["neo4j"],
  { mylistId, videoId }: { mylistId: string; videoId: string }
) => {
  const session = neo4j.session();
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

export const undoLikeVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  ensureContextUser(UserRole.NORMAL, async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID("Video", videoGqlId);

    const likelist = await prisma.mylist.findFirst({ where: { holder: { id: user.id }, isLikeList: true } });
    if (!likelist) throw new GraphQLError(`like list for "${user.id}" is not found`); // TODO:

    const registration = await prisma.mylistRegistration.delete({
      where: {
        mylistId_videoId: {
          mylistId: likelist.id,
          videoId,
        },
      },
      include: {
        video: true,
        mylist: true,
      },
    });

    await undoLikeVideoInNeo4j(neo4j, { mylistId: registration.mylistId, videoId: registration.videoId });

    return {
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
