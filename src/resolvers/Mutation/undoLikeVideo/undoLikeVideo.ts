import { MutationResolvers, UndoLikeVideoFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
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
  (async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user)
      return {
        __typename: "UndoLikeVideoFailedPayload",
        message: UndoLikeVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "UndoLikeVideoFailedPayload",
        message: UndoLikeVideoFailedMessage.InvalidVideoId,
      };

    if (!(await prisma.video.findUnique({ where: { id: videoId.data } })))
      return {
        __typename: "UndoLikeVideoFailedPayload",
        message: UndoLikeVideoFailedMessage.VideoNotFound,
      };

    const likelist = await prisma.mylist.findFirst({ where: { holder: { id: user.id }, isLikeList: true } });
    if (!likelist)
      return {
        __typename: "UndoLikeVideoFailedPayload",
        message: UndoLikeVideoFailedMessage.Unknown, // 本来起こり得ないため
      };

    if (
      !(await prisma.mylistRegistration.findUnique({
        where: { mylistId_videoId: { mylistId: likelist.id, videoId: videoId.data } },
      }))
    )
      return {
        __typename: "UndoLikeVideoFailedPayload",
        message: UndoLikeVideoFailedMessage.VideoNotLiked,
      };

    const registration = await prisma.mylistRegistration.delete({
      where: {
        mylistId_videoId: {
          mylistId: likelist.id,
          videoId: videoId.data,
        },
      },
      include: {
        video: true,
        mylist: true,
      },
    });

    await undoLikeVideoInNeo4j(neo4j, { mylistId: registration.mylistId, videoId: registration.videoId });

    return {
      __typename: "UndoLikeVideoSucceededPayload",
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
