import { LikeVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";

export const addMylistRegistrationInNeo4j = async (
  neo4j: ResolverDeps["neo4j"],
  { mylistId, videoId }: { videoId: string; mylistId: string }
) => {
  const session = neo4j.session();
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

export const likeVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_parent, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user)
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.InvalidVideoId,
      };

    if (!(await prisma.video.findUnique({ where: { id: videoId.data } })))
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.VideoNotFound,
      };

    const likelist = await prisma.mylist.findFirst({ where: { holder: { id: user.id }, isLikeList: true } });
    if (!likelist)
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.Unknown, // 本来起こり得ないため
      };

    if (
      await prisma.mylistRegistration.findUnique({
        where: { mylistId_videoId: { mylistId: likelist.id, videoId: videoId.data } },
      })
    )
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.VideoAlreadyLiked,
      };

    const registration = await prisma.mylistRegistration.create({
      data: {
        note: null,
        videoId: videoId.data,
        mylistId: likelist.id,
      },
    });

    await addMylistRegistrationInNeo4j(neo4j, { videoId: registration.videoId, mylistId: registration.mylistId });

    return {
      __typename: "LikeVideoSuccessedPayload",
      registration: new MylistRegistrationModel(registration),
    };
  }) satisfies MutationResolvers["likeVideo"];
