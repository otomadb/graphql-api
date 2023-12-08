import {
  Notification,
  Prisma,
  SemitagEventType,
  Video,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
  YoutubeRegistrationRequest,
  YoutubeVideoSourceEventType,
} from "@prisma/client";
import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers, RegisterVideoFromYoutubeFailedMessage, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID3, parseGqlIDs3 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { checkDuplicate } from "../utils/checkDuplicate.js";
import { isValidYoutubeSourceId } from "../utils/isValidYoutubeSourceId.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";

async function mkAcceptTransaction(
  prisma: ResolverDeps["prisma"],
  requestId: string | null,
  {
    videoId,
    userId,
  }: {
    videoId: string;
    userId: string;
  },
): Promise<
  Result<
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    (
      | Prisma.Prisma__YoutubeRegistrationRequestClient<unknown, never>
      | Prisma.Prisma__NotificationClient<unknown, never>
    )[]
  >
> {
  if (!requestId) return ok([]);

  const request = await prisma.youtubeRegistrationRequest.findUnique({ where: { id: requestId } });

  if (!request) return err({ type: "REQUEST_NOT_FOUND", requestId });
  if (request.isChecked) return err({ type: "REQUEST_ALREADY_CHECKED", requestId });

  const checkingId = ulid();
  return ok([
    prisma.youtubeRegistrationRequest.update({
      where: { id: requestId },
      data: {
        isChecked: true,
        checking: {
          create: {
            id: checkingId,
            video: { connect: { id: videoId } },
            checkedBy: { connect: { id: userId } },
          },
        },
        events: { create: { userId, type: "ACCEPT" } },
      },
    }),
    prisma.notification.create({
      data: {
        notifyToId: request.requestedById,
        type: "ACCEPTING_YOUTUBE_REGISTRATION_REQUEST",
        payload: { id: checkingId },
      },
    }),
  ]);
}

export const getRequestCheck = async (
  prisma: ResolverDeps["prisma"],
  { requestId, videoId, userId }: { requestId: string | null; userId: string; videoId: string },
): Promise<
  Result<
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    (
      | Prisma.Prisma__YoutubeRegistrationRequestClient<YoutubeRegistrationRequest, never>
      | Prisma.Prisma__NotificationClient<Notification, never>
    )[]
  >
> => {
  if (!requestId) return ok([]);

  try {
    const request = await prisma.youtubeRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) return err({ type: "REQUEST_NOT_FOUND", requestId });
    if (request.isChecked) return err({ type: "REQUEST_ALREADY_CHECKED", requestId });

    const checkingId = ulid();
    const tx = [
      prisma.youtubeRegistrationRequest.update({
        where: { id: requestId },
        data: {
          isChecked: true,
          checking: {
            create: {
              id: checkingId,
              video: { connect: { id: videoId } },
              checkedBy: { connect: { id: userId } },
            },
          },
          events: { create: { userId, type: "ACCEPT" } },
        },
      }),
      prisma.notification.create({
        data: {
          notifyToId: request.requestedById,
          type: "ACCEPTING_YOUTUBE_REGISTRATION_REQUEST",
          payload: { id: checkingId },
        },
      }),
    ];
    return ok(tx);
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
  }
};

export const registerVideoInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
  videoId: string,
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();

    const videotags = await prisma.videoTag.findMany({ where: { videoId } });
    for (const { id } of videotags) {
      await updateWholeVideoTags({ prisma, tx }, id);
    }

    /* TODO: SemitagをNeo4j内でどう扱うかは未定
    const semitags = await prisma.semitag.findMany({ where: { videoId } });
    for (const { videoId, id, name } of semitags) {
      tx.run(
        `
        MERGE (v:Video {id: $video_id})
        MERGE (s:Semitag {id: $semitag_id})
        SET s.name = $semitag_name
        MERGE r=(v)-[:SEMITAGGED_BY]->(s)
        RETURN r
        `,
        {
          video_id: videoId,
          semitag_id: id,
          semitag_name: name,
        }
      );
    }
    */

    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    authUserId,
    primaryTitle,
    extraTitles,
    primaryThumbnail,
    tagIds,
    semitagNames,
    sourceIds,
    requestId,
  }: {
    authUserId: string;
    primaryTitle: string;
    extraTitles: string[];
    primaryThumbnail: string;
    tagIds: string[];
    semitagNames: string[];
    sourceIds: string[];
    requestId: string | null;
  },
): Promise<
  Result<
    | { type: "NO_TAG"; tagId: string }
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    Video
  >
> => {
  const videoId = ulid();
  const dataTitles = [
    { id: ulid(), title: primaryTitle, isPrimary: true },
    ...extraTitles.map((extraTitle) => ({
      id: ulid(),
      title: extraTitle,
      isPrimary: false,
    })),
  ];
  const dataThumbnails = [
    {
      id: ulid(),
      imageUrl: primaryThumbnail,
      isPrimary: true,
    },
  ];
  const dataTags = tagIds.map((tagId) => ({
    id: ulid(),
    tagId,
  }));
  const dataSemitags = semitagNames.map((name) => ({
    id: ulid(),
    name,
    isChecked: false,
  }));
  const dataYoutubeSources = sourceIds.map((sourceId) => ({
    id: ulid(),
    sourceId,
  }));

  const checkRequest = await getRequestCheck(prisma, { requestId, videoId, userId: authUserId });
  if (isErr(checkRequest)) return checkRequest;

  const transactionReq = await mkAcceptTransaction(prisma, requestId, { userId: authUserId, videoId });
  if (isErr(transactionReq)) {
    switch (transactionReq.error.type) {
      case "REQUEST_NOT_FOUND":
        return err({
          type: "REQUEST_NOT_FOUND",
          requestId: transactionReq.error.requestId,
        });
      case "REQUEST_ALREADY_CHECKED":
        return err({
          type: "REQUEST_ALREADY_CHECKED",
          requestId: transactionReq.error.requestId,
        });
      case "INTERNAL_SERVER_ERROR":
        return err({
          type: "INTERNAL_SERVER_ERROR",
          error: transactionReq.error.error,
        });
    }
  }

  const [video] = await prisma.$transaction([
    prisma.video.create({
      data: {
        id: videoId,
        titles: { createMany: { data: dataTitles } },
        thumbnails: { createMany: { data: dataThumbnails } },
        tags: { createMany: { data: dataTags } },
        semitags: { createMany: { data: dataSemitags } },
        youtubeSources: { createMany: { data: dataYoutubeSources } },
      },
    }),
    prisma.videoEvent.createMany({
      data: [
        {
          userId: authUserId,
          videoId,
          type: VideoEventType.REGISTER,
          payload: {},
        },
      ],
    }),
    prisma.videoTitleEvent.createMany({
      data: [
        ...dataTitles.map(({ id }) => ({
          userId: authUserId,
          videoTitleId: id,
          type: VideoTitleEventType.CREATE,
          payload: {},
        })),
        {
          userId: authUserId,
          videoTitleId: dataTitles[0].id,
          type: VideoTitleEventType.SET_PRIMARY,
          payload: {},
        },
      ],
    }),
    prisma.videoThumbnailEvent.createMany({
      data: [
        ...dataThumbnails.map(({ id }) => ({
          userId: authUserId,
          videoThumbnailId: id,
          type: VideoThumbnailEventType.CREATE,
          payload: {},
        })),
        {
          userId: authUserId,
          videoThumbnailId: dataThumbnails[0].id,
          type: VideoThumbnailEventType.SET_PRIMARY,
          payload: {},
        },
      ],
    }),
    prisma.videoTagEvent.createMany({
      data: [
        ...dataTags.map(({ id }) => ({
          userId: authUserId,
          videoTagId: id,
          type: VideoTagEventType.ATTACH,
          payload: {},
        })),
      ],
    }),
    prisma.semitagEvent.createMany({
      data: [
        ...dataSemitags.map(({ id }) => ({
          userId: authUserId,
          semitagId: id,
          type: SemitagEventType.ATTACH,
          payload: {},
        })),
      ],
    }),
    prisma.youtubeVideoSourceEvent.createMany({
      data: [
        ...dataYoutubeSources.map(({ id }) => ({
          userId: authUserId,
          sourceId: id,
          type: YoutubeVideoSourceEventType.CREATE,
          payload: {},
        })),
      ],
    }),
    ...transactionReq.data,
  ]);

  return ok(video);
};

export const resolverRegisterVideoFromYoutube = ({
  prisma,
  logger,
  neo4j,
  TimelineEventService,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "TimelineEventService">) =>
  (async (_parent, { input }, { currentUser: user }) => {
    // Request IDの妥当性チェック
    const requestId = input.requestId ? parseGqlID3("YoutubeRegistrationRequest", input.requestId) : null;
    if (requestId && isErr(requestId)) {
      logger.error("Request ID is wrong form", { requestId: input.requestId });
      throw new GraphQLError("Invalid Request");
    }

    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterVideoFromYoutubeTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
      }
    }
    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterVideoFromYoutubeSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
    }

    // Youtubeの動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidYoutubeSourceId(id))
        return {
          __typename: "RegisterVideoFromYoutubeInvalidYoutubeSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
    }

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnailUrl,
      tagIds: tagIds.data,
      semitagNames: semitagNames.data,
      sourceIds: input.sourceIds,
      requestId: requestId?.data ?? null,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "NO_TAG":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "MutationYoutubeRegistrationRequestNotFoundError",
            requestId: result.error.requestId,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "MutationYoutubeRegistrationRequestAlreadyCheckedError",
            requestId: result.error.requestId,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
        case "INTERNAL_SERVER_ERROR":
          return {
            __typename: "RegisterVideoFromYoutubeOtherErrorsFallback",
            message: RegisterVideoFromYoutubeFailedMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
      }
    }

    const video = result.data;
    await registerVideoInNeo4j({ prisma, logger, neo4j }, video.id);

    await TimelineEventService.clearAll();

    return {
      __typename: "RegisterVideoFromYoutubeSucceededPayload",
      video: new VideoDTO(video),
    } satisfies ResolversTypes["RegisterVideoFromYoutubePayload"];
  }) satisfies MutationResolvers["registerVideoFromYoutube"];
