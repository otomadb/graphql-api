import {
  NicovideoRegistrationRequest,
  NicovideoVideoSourceEventType,
  Notification,
  Prisma,
  SemitagEventType,
  Video,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { MutationResolvers, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID3, parseGqlIDs3 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { checkDuplicate } from "../utils/checkDuplicate.js";
import { isValidNicovideoSourceId } from "../utils/isValidNicovideoSourceId.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";

export const registerVideoInNeo4j = async (
  { prisma, neo4j, TimelineEventService }: Pick<ResolverDeps, "prisma" | "logger" | "neo4j">,
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

export const getRequestCheck = async (
  prisma: ResolverDeps["prisma"],
  { requestId, videoId, userId }: { requestId: string | null; userId: string; videoId: string },
): Promise<
  Result<
    | { type: "REQUEST_NOT_FOUND"; requestId: string }
    | { type: "REQUEST_ALREADY_CHECKED"; requestId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    (
      | Prisma.Prisma__NicovideoRegistrationRequestClient<NicovideoRegistrationRequest, never>
      | Prisma.Prisma__NotificationClient<Notification, never>
    )[]
  >
> => {
  if (!requestId) return ok([]);

  try {
    const request = await prisma.nicovideoRegistrationRequest.findUnique({ where: { id: requestId } });
    if (!request) return err({ type: "REQUEST_NOT_FOUND", requestId });
    if (request.isChecked) return err({ type: "REQUEST_ALREADY_CHECKED", requestId });

    const checkingId = ulid();
    const tx = [
      prisma.nicovideoRegistrationRequest.update({
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
          type: "ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST",
          payload: { id: checkingId },
        },
      }),
    ];
    return ok(tx);
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
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
  const dataNicovideoSources = sourceIds.map((sourceId) => ({
    id: ulid(),
    sourceId: sourceId.toLowerCase(),
  }));

  const checkRequest = await getRequestCheck(prisma, { requestId, videoId, userId: authUserId });
  if (isErr(checkRequest)) return checkRequest;

  const [video] = await prisma.$transaction([
    prisma.video.create({
      data: {
        id: videoId,
        titles: { createMany: { data: dataTitles } },
        thumbnails: { createMany: { data: dataThumbnails } },
        tags: { createMany: { data: dataTags } },
        semitags: { createMany: { data: dataSemitags } },
        nicovideoSources: { createMany: { data: dataNicovideoSources } },
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
    prisma.nicovideoVideoSourceEvent.createMany({
      data: [
        ...dataNicovideoSources.map(({ id }) => ({
          userId: authUserId,
          sourceId: id,
          type: NicovideoVideoSourceEventType.CREATE,
          payload: {},
        })),
      ],
    }),
    ...checkRequest.data,
  ]);

  return ok(video);
};

export const resolverRegisterVideoFromNicovideo = ({
  prisma,
  logger,
  neo4j,
  TimelineEventService,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "TimelineEventService">) =>
  (async (_parent, { input }, { currentUser: user }, info) => {
    // TagのIDの妥当性及び重複チェック
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: tagIds.error.type,
          } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
        case "DUPLICATED":
          return {
            __typename: "RegisterVideoFromNicovideoTagIdsDuplicatedError",
            tagId: tagIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
      }
    }

    // Semitagのnameの重複チェック
    const toolongSemitag = input.semitagNames.find((v) => 36 < v.length);
    if (toolongSemitag)
      return {
        __typename: "RegisterVideoFromNicovideoSemitagTooLongError",
        name: toolongSemitag,
      } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];

    // Semitagのnameの重複チェック
    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) {
      return {
        __typename: "RegisterVideoFromNicovideoSemitagNamesDuplicatedError",
        name: semitagNames.error,
      } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
    }

    // リクエストIDのチェック
    const nicovideoRequestId = input.requestId ? parseGqlID3("NicovideoRegistrationRequest", input.requestId) : null;
    if (nicovideoRequestId && isErr(nicovideoRequestId)) {
      return {
        __typename: "MutationInvalidNicovideoRegistrationRequestIdError",
        requestId: nicovideoRequestId.error.invalidId,
      } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
    }

    // ニコニコ動画の動画IDチェック
    for (const id of input.sourceIds) {
      if (!isValidNicovideoSourceId(id))
        return {
          __typename: "RegisterVideoFromNicovideoInvalidNicovideoSourceIdError",
          sourceID: id,
        } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
    }

    const result = await register(prisma, {
      authUserId: user.id,
      primaryTitle: input.primaryTitle,
      extraTitles: input.extraTitles,
      primaryThumbnail: input.primaryThumbnailUrl,
      tagIds: tagIds.data,
      semitagNames: semitagNames.data,
      sourceIds: input.sourceIds,
      requestId: nicovideoRequestId?.data ?? null,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "NO_TAG":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
        case "REQUEST_NOT_FOUND":
          return {
            __typename: "MutationNicovideoRegistrationRequestNotFoundError",
            requestId: result.error.requestId,
          } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
        case "REQUEST_ALREADY_CHECKED":
          return {
            __typename: "MutationNicovideoRegistrationRequestAlreadyCheckedError",
            requestId: result.error.requestId,
          } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new Error("Internal server error");
      }
    }

    const video = result.data;
    await registerVideoInNeo4j({ prisma, logger, neo4j }, video.id);

    await TimelineEventService.clearAll();

    return {
      __typename: "RegisterVideoFromNicovideoSucceededPayload",
      video: new VideoDTO(video),
    } satisfies ResolversTypes["RegisterVideoFromNicovideoPayload"];
  }) satisfies MutationResolvers["registerVideoFromNicovideo"];
