import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { pino } from "pino";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { cleanPrisma } from "../test/cleanPrisma.js";
import {
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
} from "./TimelineEvent.dto.js";
import { Cache, mkTimelineEventService, TimelineEventService } from "./TimelineEvent.service.js";

describe("TimelineEventService", () => {
  let prisma: PrismaClient;
  let redis: Redis;
  let service: TimelineEventService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();

    redis = new Redis(process.env.REDIS_URL);

    service = mkTimelineEventService({ prisma, logger: pino(), redis });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
    await redis.flushall();
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("calcTimelineEvents()", () => {
    beforeEach(async () => {
      await prisma.$transaction([
        prisma.video.createMany({ data: [{ id: "video1" }] }),
        prisma.user.create({ data: { id: "user1" } }),
        prisma.nicovideoRegistrationRequest.createMany({
          data: [
            {
              id: "nicovideo_req1",
              isChecked: true,
              requestedById: "user1",
              title: "nicovideo_req1",
              sourceId: "nicovideo_req1",
              thumbnailUrl: "thumbnail",
            },
            {
              id: "nicovideo_req2",
              isChecked: true,
              requestedById: "user1",
              title: "nicovideo_req2",
              sourceId: "nicovideo_req2",
              thumbnailUrl: "thumbnail",
            },
          ],
        }),
        prisma.youtubeRegistrationRequest.createMany({
          data: [
            {
              id: "youtube_req1",
              isChecked: true,
              requestedById: "user1",
              title: "youtube_req1",
              sourceId: "youtube_req1",
              thumbnailUrl: "thumbnail",
            },
            {
              id: "youtube_req2",
              isChecked: true,
              requestedById: "user1",
              title: "youtube_req2",
              sourceId: "youtube_req2",
              thumbnailUrl: "thumbnail",
            },
          ],
        }),
        prisma.videoEvent.createMany({
          data: [
            {
              id: "1_1",
              type: "REGISTER",
              userId: "user1",
              videoId: "video1",
              createdAt: new Date("2021-01-01T00:00:00.000Z"),
              payload: {},
            },
            {
              id: "1_2",
              type: "REGISTER",
              userId: "user1",
              videoId: "video1",
              createdAt: new Date("2021-01-02T00:00:00.000Z"),
              payload: {},
            },
          ],
        }),
        prisma.nicovideoRegistrationRequestEvent.createMany({
          data: [
            {
              id: "2_1",
              type: "REQUEST",
              requestId: "nicovideo_req1",
              userId: "user1",
              createdAt: new Date("2021-01-01T01:00:00.000Z"),
            },
            {
              id: "2_2",
              type: "REQUEST",
              requestId: "nicovideo_req2",
              userId: "user1",
              createdAt: new Date("2021-01-02T01:00:00.000Z"),
            },
          ],
        }),
        prisma.youtubeRegistrationRequestEvent.createMany({
          data: [
            {
              id: "3_1",
              type: "REQUEST",
              requestId: "youtube_req1",
              userId: "user1",
              createdAt: new Date("2021-01-01T02:00:00.000Z"),
            },
            {
              id: "3_2",
              type: "REQUEST",
              requestId: "youtube_req2",
              userId: "user1",
              createdAt: new Date("2021-01-02T02:00:00.000Z"),
            },
          ],
        }),
      ]);
    });

    test("Redis側ですでに必要分がキャッシュ済み", async () => {
      await redis.set(
        "timeline:user1",
        JSON.stringify([
          {
            type: "REGISTER",
            videoId: "video4",
            createdAt: new Date("2021-01-04T00:00:00.000Z"),
          },
          {
            type: "REGISTER",
            videoId: "video3",
            createdAt: new Date("2021-01-03T00:00:00.000Z"),
          },
          {
            type: "REGISTER",
            videoId: "video2",
            createdAt: new Date("2021-01-02T00:00:00.000Z"),
          },
          {
            type: "REGISTER",
            videoId: "video1",
            createdAt: new Date("2021-01-01T00:00:00.000Z"),
          },
        ] satisfies Cache[]),
      );

      const actual = await service.calcTimelineEvents("user1", { take: 2, skip: 1 });
      expect(actual.length).toBe(2);

      const actual0 = actual[0] as MadRegisteredTimelineEventDTO;
      expect(actual0.createdAt).toStrictEqual(new Date("2021-01-03T00:00:00.000Z"));
      expect(actual0.videoId).toBe("video3");

      const actual1 = actual[1] as MadRegisteredTimelineEventDTO;
      expect(actual1.createdAt).toStrictEqual(new Date("2021-01-02T00:00:00.000Z"));
      expect(actual1.videoId).toBe("video2");
    });

    test("Redis側のキャッシュが空", async () => {
      const actual = await service.calcTimelineEvents("user1", { take: 3, skip: 3 });
      expect(actual.length).toBe(3);

      const acutal0 = actual[0] as YoutubeMadRequestedTimelineEventDTO;
      expect(acutal0.createdAt).toStrictEqual(new Date("2021-01-01T02:00:00.000Z"));
      expect(acutal0.requestId).toBe("youtube_req1");

      const acutal1 = actual[1] as NicovideoMadRequestedTimelineEventDTO;
      expect(acutal1.createdAt).toStrictEqual(new Date("2021-01-01T01:00:00.000Z"));
      expect(acutal1.requestId).toBe("nicovideo_req1");

      const acutal2 = actual[2] as MadRegisteredTimelineEventDTO;
      expect(acutal2.createdAt).toStrictEqual(new Date("2021-01-01T00:00:00.000Z"));
      expect(acutal2.videoId).toBe("video1");

      const actualCached = await redis.get("timeline:user1").then((v) => JSON.parse(v ?? "[]"));
      expect(Array.isArray(actualCached)).toBe(true);
      expect(actualCached.length).toBe(6);
    });
  });

  describe("clearAll()", () => {
    test("全てを消す", async () => {
      await redis.set("timeline:user1", "something cache");
      await redis.set("timeline:user2", "something cache");
      await redis.set("timeline:user3", "something cache");

      await service.clearAll();

      await expect(await redis.get("timeline:user1")).toBeNull();
      await expect(await redis.get("timeline:user2")).toBeNull();
      await expect(await redis.get("timeline:user3")).toBeNull();
    });
  });
});
