import { Mylist, MylistRegistration, Video } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { isErr } from "../../../utils/Result.js";
import { LikeVideoFailedMessage, MutationResolvers } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { ResolverDeps } from "../../types.js";
import { likeVideoInNeo4j } from "./neo4j.js";

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
        id: ulid(),
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

export const likeVideo = ({ prisma, neo4j, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_parent, { input: { videoId: videoGqlId } }, { currentUser: user }, info) => {
    if (!user)
      return {
        __typename: "LikeVideoFailedPayload",
        message: LikeVideoFailedMessage.Forbidden,
      };

    const videoId = parseGqlID2("Video", videoGqlId);
    if (isErr(videoId)) {
      return { __typename: "LikeVideoFailedPayload", message: LikeVideoFailedMessage.InvalidVideoId };
    }

    const result = await like(prisma, { userId: user.id, videoId: videoId.data });
    if (isErr(result)) {
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

    const neo4jResult = await likeVideoInNeo4j({ prisma, neo4j }, registration.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    return {
      __typename: "LikeVideoSucceededPayload",
      registration: new MylistRegistrationModel(registration),
    };
  }) satisfies MutationResolvers["likeVideo"];
