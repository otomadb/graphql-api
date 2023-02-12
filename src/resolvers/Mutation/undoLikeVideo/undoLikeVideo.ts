import { Mylist, MylistRegistration, Video } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
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

export const undo = async (
  prisma: ResolverDeps["prisma"],
  { videoId, userId }: { videoId: string; userId: string }
): Promise<
  Result<
    "VIDEO_NOT_FOUND" | "LIKELIST_NOT_FOUND" | "NOT_REGISTERED" | "ALREADY_UNREGISTERED",
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
  if (!ext) return err("NOT_REGISTERED");
  if (!ext.isRemoved) return err("ALREADY_UNREGISTERED");

  const registration = await prisma.mylistRegistration.update({
    where: { id: ext.id },
    data: { isRemoved: true, events: { create: { type: "UNREGISTER", userId, payload: {} } } },
    include: { video: true, mylist: true },
  });
  return ok(registration);
};

export const undoLikeVideo = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_, { input: { videoId: videoGqlId } }, { user }) => {
    if (!user) return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.Forbidden };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.InvalidVideoId };

    const result = await undo(prisma, { userId: user.id, videoId: videoId.data });
    if (result.status === "error") {
      switch (result.error) {
        case "VIDEO_NOT_FOUND":
          return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.VideoNotFound };
        case "NOT_REGISTERED":
          return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.VideoNotLiked };
        case "LIKELIST_NOT_FOUND":
        case "ALREADY_UNREGISTERED":
          return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.Unknown };
      }
    }

    const registration = result.data;
    await undoLikeVideoInNeo4j(neo4j, { mylistId: registration.mylistId, videoId: registration.videoId });

    return {
      __typename: "UndoLikeVideoSucceededPayload",
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
