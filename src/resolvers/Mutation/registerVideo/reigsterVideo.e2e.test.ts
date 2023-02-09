import { describe } from "@jest/globals";
import { PrismaClient } from "@prisma/client";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ResolverDeps } from "../../index.js";
import { VideoAddTagEventPayload } from "../../VideoAddTagEvent/index.js";
import { register } from "./registerVideo.js";

describe("Mutation.registerVideo", () => {
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
          { id: "t1", meaningless: false },
          { id: "t2", meaningless: false },
        ],
      }),
    ]);

    const actual = await register(prisma, {
      authUserId: "u1",
      primaryTitle: "Video 1",
      extraTitles: ["Video 1.1", "Video 1.2"],
      primaryThumbnail: "https://example.com/1.jpg",
      tagIds: ["t1", "t2"],
      semitagNames: ["Semitag 1", "Semitag 2"],
      nicovideoSourceIds: ["sm1"],
    });
    expect(actual).toStrictEqual(
      expect.objectContaining({
        id: expect.any(String),
      })
    );

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: actual.id },
      include: {
        titles: true,
        thumbnails: true,
        tags: true,
        semitags: true,
        nicovideoSources: true,
      },
    });
    const actualEvents = await prisma.videoEvent.findMany({});
    expect(actualEvents).toHaveLength(12);
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: video.id,
        userId: "u1",
        type: "REGISTER",
        payload: {},
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_TITLE",
        payload: { id: video.titles[0].id },
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_TITLE",
        payload: { id: video.titles[1].id },
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_TITLE",
        payload: { id: video.titles[2].id },
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "SET_PRIMARY_TITLE",
        payload: { id: video.titles[0].id },
      })
    );

    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_THUMBNAIL",
        payload: { id: video.thumbnails[0].id },
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "SET_PRIMARY_THUMBNAIL",
        payload: { id: video.thumbnails[0].id },
      })
    );

    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_TAG",
        payload: { tagId: "t1", isUpdate: false } satisfies VideoAddTagEventPayload,
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_TAG",
        payload: { tagId: "t2", isUpdate: false } satisfies VideoAddTagEventPayload,
      })
    );

    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_SEMITAG",
        payload: { id: video.semitags[0].id },
      })
    );
    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_SEMITAG",
        payload: { id: video.semitags[1].id },
      })
    );

    expect(actualEvents).toContainEqual(
      expect.objectContaining({
        id: expect.any(String),
        videoId: actual.id,
        userId: "u1",
        type: "ADD_NICOVIDEO_SOURCE",
        payload: { id: video.nicovideoSources[0].id },
      })
    );
  });
});
