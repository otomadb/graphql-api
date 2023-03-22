import { Mylist, MylistRegistration, Video } from "@prisma/client";

import { err, isErr, ok, Result } from "../../../utils/Result.js";
import { MutationResolvers, UndoLikeVideoFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { MylistModel } from "../../Mylist/model.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";
import { undoLikeVideoInNeo4j } from "./neo4j.js";

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
  if (ext.isRemoved) return err("ALREADY_UNREGISTERED");

  const registration = await prisma.mylistRegistration.update({
    where: { id: ext.id },
    data: { isRemoved: true, events: { create: { type: "UNREGISTER", userId, payload: {} } } },
    include: { video: true, mylist: true },
  });
  return ok(registration);
};

export const undoLikeVideo = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_, { input: { videoId: videoGqlId } }, { user }, info) => {
    if (!user) return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.Forbidden };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return { __typename: "UndoLikeVideoFailedPayload", message: UndoLikeVideoFailedMessage.InvalidVideoId };

    const result = await undo(prisma, { userId: user.id, videoId: videoId.data });
    if (isErr(result)) {
      switch (result.error) {
        case "VIDEO_NOT_FOUND":
          return {
            __typename: "UndoLikeVideoFailedPayload",
            message: UndoLikeVideoFailedMessage.VideoNotFound,
          };
        case "NOT_REGISTERED":
          return {
            __typename: "UndoLikeVideoFailedPayload",
            message: UndoLikeVideoFailedMessage.VideoNotLiked,
          };
        case "ALREADY_UNREGISTERED":
          return {
            __typename: "UndoLikeVideoFailedPayload",
            message: UndoLikeVideoFailedMessage.VideoNotLiked,
          };
        case "LIKELIST_NOT_FOUND":
          return {
            __typename: "UndoLikeVideoFailedPayload",
            message: UndoLikeVideoFailedMessage.Unknown,
          };
      }
    }

    const registration = result.data;
    const neo4jResult = await undoLikeVideoInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "UndoLikeVideoSucceededPayload",
      registration: new MylistRegistrationModel(registration),
      video: new VideoModel(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["undoLikeVideo"];
