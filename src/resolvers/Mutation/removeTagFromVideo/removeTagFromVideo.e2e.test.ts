import { describe } from "@jest/globals";
import { PrismaClient } from "@prisma/client";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../index.js";
import { remove } from "./removeTagFromVideo.js";

describe("Mutation.removeTagFromVideo", () => {
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
    });
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
    });
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
    });
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
        data: { videoId: "v1", tagId: "t1" },
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
      }),
    });

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: "v1" },
      include: {
        titles: true,
        thumbnails: true,
        tags: true,
        semitags: true,
        nicovideoSources: true,
      },
    });
    const actualEvents = await prisma.videoEvent.findMany({});
    expect(actualEvents).toHaveLength(1);
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: video.id,
        userId: "u1",
        type: "REMOVE_TAG",
        payload: { tagId: "t1" },
      })
    );
  });
});
