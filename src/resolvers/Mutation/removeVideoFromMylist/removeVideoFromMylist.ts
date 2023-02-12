import { Mylist, MylistRegistration, Video } from "@prisma/client";
import { Driver as Neo4jDriver } from "neo4j-driver";

import { err, ok, Result } from "../../../utils/Result.js";
import { MutationResolvers, RemoveVideoFromMylistFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
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

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { videoId, mylistId, userId }: { userId: string; videoId: string; mylistId: string }
): Promise<
  Result<
    "VIDEO_NOT_FOUND" | "MYLIST_NOT_FOUND" | "NOT_MYLIST_HOLDER" | "NOT_REGISTERED" | "ALREADY_UNREGISTERED",
    MylistRegistration & { mylist: Mylist; video: Video }
  >
> => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return err("VIDEO_NOT_FOUND");

  const mylist = await prisma.mylist.findFirst({ where: { id: mylistId } });
  if (!mylist) return err("MYLIST_NOT_FOUND");
  if (mylist.holderId !== userId) return err("NOT_MYLIST_HOLDER");

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

export const removeVideoFromMylist = ({ prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_, { input: { mylistId: mylistGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user)
      return {
        __typename: "RemoveVideoFromMylistFailedPayload",
        message: RemoveVideoFromMylistFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (videoId.status === "error")
      return {
        __typename: "RemoveVideoFromMylistFailedPayload",
        message: RemoveVideoFromMylistFailedMessage.InvalidVideoId,
      };

    const mylistId = parseGqlID2("Mylist", mylistGqlId);
    if (mylistId.status === "error")
      return {
        __typename: "RemoveVideoFromMylistFailedPayload",
        message: RemoveVideoFromMylistFailedMessage.InvalidMylistId,
      };

    const result = await remove(prisma, {
      userId: user.id,
      videoId: videoId.data,
      mylistId: mylistId.data,
    });
    if (result.status === "error") {
      switch (result.error) {
        case "VIDEO_NOT_FOUND":
          return {
            __typename: "RemoveVideoFromMylistFailedPayload",
            message: RemoveVideoFromMylistFailedMessage.VideoNotFound,
          };
        case "MYLIST_NOT_FOUND":
          return {
            __typename: "RemoveVideoFromMylistFailedPayload",
            message: RemoveVideoFromMylistFailedMessage.MylistNotFound,
          };
        case "NOT_MYLIST_HOLDER":
          return {
            __typename: "RemoveVideoFromMylistFailedPayload",
            message: RemoveVideoFromMylistFailedMessage.WrongMylistHolder,
          };
        case "NOT_REGISTERED":
          return {
            __typename: "RemoveVideoFromMylistFailedPayload",
            message: RemoveVideoFromMylistFailedMessage.NotRegistered,
          };
        case "ALREADY_UNREGISTERED":
          return {
            __typename: "RemoveVideoFromMylistFailedPayload",
            message: RemoveVideoFromMylistFailedMessage.AlreadyUnregistered,
          };
      }
    }

    const registration = result.data;
    await removeMylistRegistrationInNeo4j(neo4j, {
      mylistId: registration.mylist.id,
      videoId: registration.video.id,
    });

    return {
      __typename: "RemoveVideoFromMylistSucceededPayload",
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["removeVideoFromMylist"];
