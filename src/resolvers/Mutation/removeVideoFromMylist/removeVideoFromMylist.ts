import { Mylist, MylistRegistration, Video } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { isErr } from "../../../utils/Result.js";
import { VideoDTO } from "../../../Video/dto.js";
import { MutationResolvers, RemoveVideoFromMylistFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";
import { removeMylistRegistrationInNeo4j } from "./neo4j.js";

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { videoId, mylistId, userId }: { userId: string; videoId: string; mylistId: string },
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

export const removeVideoFromMylist = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_, { input: { mylistId: mylistGqlId, videoId: videoGqlId } }, { currentUser: user }, info) => {
    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId))
      return {
        __typename: "RemoveVideoFromMylistFailedPayload",
        message: RemoveVideoFromMylistFailedMessage.InvalidVideoId,
      };

    const mylistId = parseGqlID2("Mylist", mylistGqlId);
    if (isErr(mylistId))
      return {
        __typename: "RemoveVideoFromMylistFailedPayload",
        message: RemoveVideoFromMylistFailedMessage.InvalidMylistId,
      };

    const result = await remove(prisma, {
      userId: user.id,
      videoId: videoId.data,
      mylistId: mylistId.data,
    });
    if (isErr(result)) {
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
    const neo4jResult = await removeMylistRegistrationInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "RemoveVideoFromMylistSucceededPayload",
      video: new VideoDTO(registration.video),
      mylist: new MylistModel(registration.mylist),
    };
  }) satisfies MutationResolvers["removeVideoFromMylist"];
