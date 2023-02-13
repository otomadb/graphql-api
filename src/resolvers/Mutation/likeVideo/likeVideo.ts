import { Mylist, MylistRegistration, Video } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
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

export const like = async (
  prisma: ResolverDeps["prisma"],
  { videoId, userId }: { videoId: string; userId: string }
): Promise<
  Result<
    "VIDEO_NOT_FOUND" | "LIKELIST_NOT_FOUND" | "ALREADY_REGISTERED",
    MylistRegistration & { mylist: Mylist; video: Video }
  >
> => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return err("VIDEO_NOT_FOUND");

  const mylist = await prisma.mylist.findFirst({ where: { holder: { id: userId }, isLikeList: true } });
  if (!mylist) return err("LIKELIST_NOT_FOUND");

  const ext = await prisma.mylistRegistration.findUnique({
    where: { mylistId_videoId: { mylistId: mylist.id, videoId: video.id } },
  });

  if (!ext) {
    const registration = await prisma.mylistRegistration.create({
      data: {
        videoId: video.id,
        mylistId: mylist.id,
        isRemoved: false,
        events: {
          create: { type: "REGISTER", userId, payload: {} },
        },
      },
      include: { video: true, mylist: true },
    });
    return ok(registration);
  } else {
    if (!ext.isRemoved) return err("ALREADY_REGISTERED");

    const registration = await prisma.mylistRegistration.update({
      where: { id: ext.id },
      data: {
        isRemoved: false,
        events: { create: { type: "REREGISTER", userId, payload: {} } },
      },
      include: { video: true, mylist: true },
    });
    return ok(registration);
  }
};

export const likeVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_parent, { input: { videoId: videoGqlId } }, { user }, info) => {
    if (!user)
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error") {
      return { __typename: "LikeVideoFailedPayload", message: LikeVideoFailedMessage.InvalidVideoId };
    }

    const result = await like(prisma, { userId: user.id, videoId: videoId.data });
    if (result.status === "error") {
      switch (result.error) {
        case "VIDEO_NOT_FOUND":
          return { __typename: "LikeVideoFailedPayload", message: LikeVideoFailedMessage.VideoNotFound };
        case "ALREADY_REGISTERED":
          return { __typename: "LikeVideoFailedPayload", message: LikeVideoFailedMessage.VideoAlreadyLiked };
        case "LIKELIST_NOT_FOUND":
          // 本来起こり得ないため
          return { __typename: "LikeVideoFailedPayload", message: LikeVideoFailedMessage.Unknown };
      }
    }

    const registration = result.data;
    await addMylistRegistrationInNeo4j(neo4j, { videoId: registration.videoId, mylistId: registration.mylistId });

    return {
      __typename: "LikeVideoSucceededPayload",
      registration: new MylistRegistrationModel(registration),
    };
  }) satisfies MutationResolvers["likeVideo"];
