import { PrismaClient, VideoTagEvent, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { Err, Ok } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";
import { remove } from "./prisma.js";

describe("Remove tag in Prisma", () => {
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

  test("対象の動画は存在しない", async () => {
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
    ]);

    const actual = await remove(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "error",
      error: "NO_VIDEO",
    } satisfies Err<Awaited<ReturnType<typeof remove>>>);
  });

  test("対象のタグは存在しない", async () => {
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
      prisma.video.create({
        data: { id: "v1" },
      }),
    ]);

    const actual = await remove(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "error",
      error: "NO_TAG",
    } satisfies Err<Awaited<ReturnType<typeof remove>>>);
  });

  test("動画にタグ付けが存在しない", async () => {
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
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.tag.create({
        data: { id: "t1", meaningless: false },
      }),
    ]);

    const actual = await remove(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "error",
      error: "NO_TAGGING",
    } satisfies Err<Awaited<ReturnType<typeof remove>>>);
  });

  test("動画へのタグ付けはすでに存在するが，削除されている", async () => {
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
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.tag.create({
        data: { id: "t1", meaningless: false },
      }),
      prisma.videoTag.create({
        data: {
          id: ulid(),
          videoId: "v1",
          tagId: "t1",
          isRemoved: true,
        },
      }),
    ]);

    const actual = await remove(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    });
    expect(actual).toStrictEqual({
      status: "error",
      error: "REMOVED_TAGGING",
    } satisfies Err<Awaited<ReturnType<typeof remove>>>);
  });

  test("タグを動画から削除", async () => {
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
        data: {
          id: ulid(),
          videoId: "v1",
          tagId: "t1",
          isRemoved: false,
        },
      }),
    ]);

    const actual = await remove(prisma, {
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
        isRemoved: true,
      }),
    });

    const videoTagId = (actual as Ok<Awaited<ReturnType<typeof remove>>>).data.id;

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
          type: VideoTagEventType.DETACH,
          payload: {},
        } satisfies VideoTagEvent,
      ])
    );
  });
});
