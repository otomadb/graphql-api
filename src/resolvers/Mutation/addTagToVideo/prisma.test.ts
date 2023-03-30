import { PrismaClient, VideoTagEvent, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { isErr, isOk, OkData, ReturnErr, ReturnOk } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";
import { add } from "./prisma.js";

describe("Add tag in Prisma", () => {
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
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.videoTag.create({
        data: { id: ulid(), videoId: "v1", tagId: "t1", isRemoved: false },
      }),
    ]);

    const actual = (await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    })) as ReturnErr<typeof add>;
    expect(isErr(actual)).toBe(true);
    expect(actual.error).toBe("EXISTS_TAGGING");
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
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
    ]);

    const actual = (await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    })) as ReturnOk<typeof add>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: "v1",
        tagId: "t1",
        isRemoved: false,
      }) satisfies OkData<typeof actual>
    );
    const videoTagId = actual.data.id;

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
        data: { id: "t1", isCategoryTag: false },
      }),
      prisma.video.create({
        data: { id: "v1" },
      }),
      prisma.videoTag.create({
        data: { id: ulid(), videoId: "v1", tagId: "t1", isRemoved: true },
      }),
    ]);

    const actual = (await add(prisma, {
      authUserId: "u1",
      videoId: "v1",
      tagId: "t1",
    })) as ReturnOk<typeof add>;
    expect(isOk(actual)).toBe(true);
    expect(actual.data).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: "v1",
        tagId: "t1",
        isRemoved: false,
      }) satisfies OkData<typeof actual>
    );

    const videoTagId = actual.data.id;

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
