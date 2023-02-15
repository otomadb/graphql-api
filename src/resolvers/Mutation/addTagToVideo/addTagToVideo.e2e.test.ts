import { PrismaClient, VideoTagEvent, VideoTagEventType } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { Ok } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";
import { add } from "./addTagToVideo.js";

describe("Mutation.addTagToVideo", () => {
  let prisma: ResolverDeps["prisma"];

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("すでにタグが登録されている場合", async () => {
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
      prisma.tag.create({
        data: { id: "t1", meaningless: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.videoTag.create({
        data: { videoId: "v1", tagId: "t1", isRemoved: false },
      }),
    ]);

    const actual = await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "error",
      error: "EXISTS_TAGGING",
    } satisfies Awaited<ReturnType<typeof add>>);
  });

  test("初回のタグの動画への付与）", async () => {
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
      prisma.tag.create({
        data: { id: "t1", meaningless: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
    ]);

    const actual = await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "ok",
      data: expect.objectContaining({
        id: expect.any(String),
        videoId: "v1",
        tagId: "t1",
        isRemoved: false,
      }),
    } satisfies Ok<Awaited<ReturnType<typeof add>>>);

    const videoTagId = (actual as Ok<Awaited<ReturnType<typeof add>>>).data.id;

    const videoTagEvents = await prisma.videoTagEvent.findMany({ where: { videoTagId } });
    expect(videoTagEvents).toHaveLength(1);
    expect(videoTagEvents).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTagId,
          type: VideoTagEventType.ATTACH,
          payload: {},
        } satisfies VideoTagEvent,
      ])
    );
  });

  test("2回目以降のタグの動画への付与", async () => {
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
      prisma.tag.create({
        data: { id: "t1", meaningless: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.videoTag.create({
        data: { videoId: "v1", tagId: "t1", isRemoved: true },
      }),
    ]);

    const actual = await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "ok",
      data: expect.objectContaining({
        id: expect.any(String),
        videoId: "v1",
        tagId: "t1",
        isRemoved: false,
      }),
    } satisfies Ok<Awaited<ReturnType<typeof add>>>);

    const videoTagId = (actual as Ok<Awaited<ReturnType<typeof add>>>).data.id;

    const videoTagEvents = await prisma.videoTagEvent.findMany({ where: { videoTagId } });
    expect(videoTagEvents).toHaveLength(1);
    expect(videoTagEvents).toStrictEqual(
      expect.arrayContaining([
        {
          id: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          userId: "u1",
          videoTagId,
          type: VideoTagEventType.REATTACH,
          payload: {},
        } satisfies VideoTagEvent,
      ])
    );
  });
});
