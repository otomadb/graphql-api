import {
  NicovideoRegistrationRequestEvent,
  NicovideoRegistrationRequestEventType,
  NicovideoVideoSource,
  NicovideoVideoSourceEvent,
  NicovideoVideoSourceEventType,
  PrismaClient,
  Semitag,
  SemitagEvent,
  SemitagEventType,
  VideoEvent,
  VideoEventType,
  VideoTag,
  VideoTagEvent,
  VideoTagEventType,
  VideoThumbnail,
  VideoThumbnailEvent,
  VideoThumbnailEventType,
  VideoTitle,
  VideoTitleEvent,
  VideoTitleEventType,
} from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { ResolverDeps } from "../resolvers/types.js";
import { cleanPrisma } from "../test/cleanPrisma.js";
import { ErrError, isErr, isOk, OkData, ReturnErr, ReturnOk } from "../utils/Result.js";
import { getRequestCheck, register } from "./registerVideoFromNicovideo.resolver.js";

describe("Register video by Prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("getRequestCheck()", () => {
    test("リクエストが存在しない場合", async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
          },
        }),
        prisma.video.create({ data: { id: "v1" } }),
      ]);

      const actual = (await getRequestCheck(prisma, {
        requestId: "r1",
        userId: "u1",
        videoId: "v1",
      })) as ReturnErr<typeof getRequestCheck>;
      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "REQUEST_NOT_FOUND",
        requestId: "r1",
      } satisfies ErrError<typeof actual>);
    });

    test("リクエストが既にチェック済みの場合", async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
          },
        }),
        prisma.video.create({ data: { id: "v1" } }),
        prisma.nicovideoRegistrationRequest.create({
          data: {
            id: "r1",
            isChecked: true,
            sourceId: "sm1",
            thumbnailUrl: "https://example.com",
            title: "title",
            requestedById: "u1",
          },
        }),
      ]);

      const actual = (await getRequestCheck(prisma, {
        requestId: "r1",
        userId: "u1",
        videoId: "v1",
      })) as ReturnErr<typeof getRequestCheck>;
      expect(isErr(actual)).toBe(true);
      expect(actual.error).toStrictEqual({
        type: "REQUEST_ALREADY_CHECKED",
        requestId: "r1",
      } satisfies ErrError<typeof actual>);
    });

    test("正常系", async () => {
      await prisma.$transaction([
        prisma.user.create({
          data: {
            id: "u1",
          },
        }),
        prisma.video.create({ data: { id: "v1" } }),
        prisma.nicovideoRegistrationRequest.create({
          data: {
            id: "r1",
            isChecked: false,
            sourceId: "sm1",
            thumbnailUrl: "https://example.com",
            title: "title",
            requestedById: "u1",
          },
        }),
      ]);

      const actual = (await getRequestCheck(prisma, {
        requestId: "r1",
        userId: "u1",
        videoId: "v1",
      })) as ReturnOk<typeof getRequestCheck>;
      expect(isOk(actual)).toBe(true);
    });
  });

  test("動画の追加", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", disabled: false },
          { id: "t2", disabled: false },
        ],
      }),
    ]);

    const actual = (await register(prisma, {
      authUserId: "u1",
      primaryTitle: "Video 1",
      extraTitles: ["Video 1.1", "Video 1.2"],
      primaryThumbnail: "https://example.com/1.jpg",
      tagIds: ["t1", "t2"],
      semitagNames: ["Semitag 1", "Semitag 2"],
      sourceIds: ["sm1"],
      requestId: null,
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
      }) satisfies OkData<typeof actual>,
    );

    const videoId = actual.data.id;
    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
      include: {
        titles: true,
        thumbnails: true,
        tags: true,
        semitags: true,
        nicovideoSources: true,
      },
    });

    const videoEvents = await prisma.videoEvent.findMany({});
    expect(videoEvents).toHaveLength(1);
    expect(videoEvents).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoId: video.id,
          type: VideoEventType.REGISTER,
          payload: {},
        } satisfies VideoEvent),
      ]),
    );

    const videoPrimaryTitle = (await prisma.videoTitle.findFirst({
      where: { videoId, isPrimary: true },
    })) as VideoTitle;
    expect(videoPrimaryTitle).toStrictEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      isPrimary: true,
      title: "Video 1",
      videoId,
    } satisfies VideoTitle);

    const videoExtraTitles = await prisma.videoTitle.findMany({ where: { videoId, isPrimary: false } });
    expect(videoExtraTitles).toHaveLength(2);
    expect(videoExtraTitles).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          isPrimary: false,
          title: "Video 1.1",
          videoId,
        } satisfies VideoTitle,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          isPrimary: false,
          title: "Video 1.2",
          videoId,
        } satisfies VideoTitle,
      ]),
    );

    const videoTitleEvents = await prisma.videoTitleEvent.findMany({});
    expect(videoTitleEvents).toHaveLength(4);
    expect(videoTitleEvents).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTitleId: videoPrimaryTitle.id,
          type: VideoTitleEventType.CREATE,
          payload: {},
        } satisfies VideoTitleEvent,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTitleId: videoExtraTitles[0].id,
          type: VideoTitleEventType.CREATE,
          payload: {},
        } satisfies VideoTitleEvent,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTitleId: videoExtraTitles[1].id,
          type: VideoTitleEventType.CREATE,
          payload: {},
        } satisfies VideoTitleEvent,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTitleId: videoPrimaryTitle.id,
          type: VideoTitleEventType.SET_PRIMARY,
          payload: {},
        } satisfies VideoTitleEvent,
      ]),
    );

    const videoThumbnails = await prisma.videoThumbnail.findMany({ where: { videoId } });
    expect(videoThumbnails).toHaveLength(1);
    expect(videoThumbnails).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          isPrimary: true,
          imageUrl: "https://example.com/1.jpg",
          videoId,
        } satisfies VideoThumbnail,
      ]),
    );

    const videoThumbnailEvents = await prisma.videoThumbnailEvent.findMany({});
    expect(videoThumbnailEvents).toHaveLength(2);
    expect(videoThumbnailEvents).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoThumbnailId: videoThumbnails[0].id,
          type: VideoThumbnailEventType.CREATE,
          payload: {},
        } satisfies VideoThumbnailEvent,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoThumbnailId: videoThumbnails[0].id,
          type: VideoThumbnailEventType.SET_PRIMARY,
          payload: {},
        } satisfies VideoThumbnailEvent,
      ]),
    );

    const videoTags = await prisma.videoTag.findMany({ where: { videoId } });
    expect(videoTags).toHaveLength(2);
    expect(videoTags).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          tagId: "t1",
          videoId,
          isRemoved: false,
        } satisfies VideoTag,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          tagId: "t2",
          videoId,
          isRemoved: false,
        } satisfies VideoTag,
      ]),
    );

    const videoTagEvents = await prisma.videoTagEvent.findMany({});
    expect(videoTagEvents).toHaveLength(2);
    expect(videoTagEvents).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTagId: videoTags[0].id,
          type: VideoTagEventType.ATTACH,
          payload: {},
        } satisfies VideoTagEvent,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTagId: videoTags[1].id,
          type: VideoTagEventType.ATTACH,
          payload: {},
        } satisfies VideoTagEvent,
      ]),
    );

    const videoSemitags = await prisma.semitag.findMany({ where: { videoId } });
    expect(videoSemitags).toHaveLength(2);
    expect(videoSemitags).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          videoId,
          name: "Semitag 1",
          isChecked: false,
        } satisfies Semitag,
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          videoId,
          name: "Semitag 2",
          isChecked: false,
        } satisfies Semitag,
      ]),
    );
    const semitagEvents = await prisma.semitagEvent.findMany({});
    expect(semitagEvents).toHaveLength(2);
    expect(semitagEvents).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          semitagId: videoSemitags[0].id,
          type: SemitagEventType.ATTACH,
          payload: {},
        } satisfies SemitagEvent),
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          semitagId: videoSemitags[1].id,
          type: SemitagEventType.ATTACH,
          payload: {},
        } satisfies SemitagEvent),
      ]),
    );

    const nicovideoVideoSources = await prisma.nicovideoVideoSource.findMany({ where: { videoId } });
    expect(nicovideoVideoSources).toHaveLength(1);
    expect(nicovideoVideoSources).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          videoId,
          sourceId: "sm1",
          registeredAt: null,
          isOriginal: true,
        } satisfies NicovideoVideoSource,
      ]),
    );
    const nicovideoVideoSourceEvents = await prisma.nicovideoVideoSourceEvent.findMany({});
    expect(nicovideoVideoSourceEvents).toHaveLength(1);
    expect(nicovideoVideoSourceEvents).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          sourceId: nicovideoVideoSources[0].id,
          type: NicovideoVideoSourceEventType.CREATE,
          payload: {},
        } satisfies NicovideoVideoSourceEvent),
      ]),
    );
  });

  test("リクエストの受理", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
        },
      }),
      prisma.nicovideoRegistrationRequest.create({
        data: {
          id: "r1",
          isChecked: false,
          sourceId: "sm1",
          thumbnailUrl: "https://example.com",
          title: "title",
          requestedById: "u1",
        },
      }),
    ]);

    const actual = (await register(prisma, {
      authUserId: "u1",
      primaryTitle: "Video 1",
      primaryThumbnail: "https://example.com/1.jpg",

      extraTitles: [],
      tagIds: [],
      semitagNames: [],
      sourceIds: [],

      requestId: "r1",
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);

    const actualR1 = await prisma.nicovideoRegistrationRequest.findUniqueOrThrow({ where: { id: "r1" } });
    expect(actualR1.isChecked).toBe(true);

    const actualR1Check = await prisma.nicovideoRegistrationRequestChecking.findUniqueOrThrow({
      where: { requestId: "r1" },
    });
    expect(actualR1Check.videoId).toBe(actual.data.id);

    const actualR1Events = await prisma.nicovideoRegistrationRequestEvent.findMany({
      where: { requestId: "r1" },
    });
    expect(actualR1Events).toHaveLength(1);
    expect(actualR1Events[0]).toStrictEqual({
      id: expect.any(String),
      userId: "u1",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      requestId: "r1",
      payload: null,
      type: NicovideoRegistrationRequestEventType.ACCEPT,
    } satisfies NicovideoRegistrationRequestEvent);
  });
});
