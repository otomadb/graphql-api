import {
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
  YoutubeVideoSource,
  YoutubeVideoSourceEvent,
  YoutubeVideoSourceEventType,
} from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { isOk, OkData, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { register } from "./prisma.js";

describe("Register video by Prisma", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.PRISMA_DATABASE_URL } } });
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("動画の追加", async () => {
    await prisma.$transaction([
      prisma.user.create({
        data: {
          id: "u1",
          name: "user1",
          displayName: "User1",
          email: "user1@example.com",
          password: "password",
        },
      }),
      prisma.tag.createMany({
        data: [
          { id: "t1", isCategoryTag: false },
          { id: "t2", isCategoryTag: false },
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
      sourceIds: ["Q16KpquGsIc"],
    })) as ReturnOk<typeof register>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
      }) satisfies OkData<typeof actual>
    );

    const videoId = actual.data.id;
    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
      include: {
        titles: true,
        thumbnails: true,
        tags: true,
        semitags: true,
        youtubeSources: true,
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
      ])
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
      ])
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
      ])
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
      ])
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
      ])
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
      ])
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
      ])
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
      ])
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
      ])
    );

    const youtubeVideoSources = await prisma.youtubeVideoSource.findMany({ where: { videoId } });
    expect(youtubeVideoSources).toHaveLength(1);
    expect(youtubeVideoSources).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          videoId,
          sourceId: "Q16KpquGsIc",
        } satisfies YoutubeVideoSource,
      ])
    );
    const youtubeVideoSourceEvents = await prisma.youtubeVideoSourceEvent.findMany({});
    expect(youtubeVideoSourceEvents).toHaveLength(1);
    expect(youtubeVideoSourceEvents).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          sourceId: youtubeVideoSources[0].id,
          type: YoutubeVideoSourceEventType.CREATE,
          payload: {},
        } satisfies YoutubeVideoSourceEvent),
      ])
    );
  });
});
