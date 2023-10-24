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
    test("Redis側ですでに必要分がキャッシュ済み", async () => {
      await redis.set(
        `timeline:user1:${JSON.stringify({ REGISTER: true, REQUEST_NICOVIDEO: true, REQUEST_YOUTUBE: true })}`,
        JSON.stringify([
          {
            type: "REGISTER",
            videoId: "video4",
            createdAt: new Date("2021-01-04T00:00:00.000Z"),
            eventId: "4",
          },
          {
            type: "REGISTER",
            videoId: "video3",
            createdAt: new Date("2021-01-03T00:00:00.000Z"),
            eventId: "3",
          },
          {
            type: "REGISTER",
            videoId: "video2",
            createdAt: new Date("2021-01-02T00:00:00.000Z"),
            eventId: "2",
          },
          {
            type: "REGISTER",
            videoId: "video1",
            createdAt: new Date("2021-01-01T00:00:00.000Z"),
            eventId: "1",
          },
        ] satisfies Cache[]),
      );

      const actual = await service.calcTimelineEvents("user1", {
        take: 2,
        skip: 1,
        filter: { REGISTER: true, REQUEST_NICOVIDEO: true, REQUEST_YOUTUBE: true },
      });
      expect(actual.length).toBe(2);

      const actual0 = actual[0] as MadRegisteredTimelineEventDTO;
      expect(actual0.createdAt).toStrictEqual(new Date("2021-01-03T00:00:00.000Z"));
      expect(actual0.videoId).toBe("video3");
      expect(actual0.eventId).toBe("3");

      const actual1 = actual[1] as MadRegisteredTimelineEventDTO;
      expect(actual1.createdAt).toStrictEqual(new Date("2021-01-02T00:00:00.000Z"));
      expect(actual1.videoId).toBe("video2");
      expect(actual1.eventId).toBe("2");
    });

    test("Redis側のキャッシュが空", async () => {
      await prisma.$transaction([
        prisma.video.createMany({ data: [...new Array(10)].map((_, i) => ({ id: `video${i}` })) }),
        prisma.user.create({ data: { id: "user1" } }),
        prisma.nicovideoRegistrationRequest.createMany({
          data: [...new Array(10)].map((_, i) => ({
            id: `nicovideo_req${i}`,
            isChecked: true,
            requestedById: "user1",
            title: `nicovideo_req${i}`,
            sourceId: `nicovideo_req${i}`,
            thumbnailUrl: "thumbnail",
          })),
        }),
        prisma.youtubeRegistrationRequest.createMany({
          data: [...new Array(10)].map((_, i) => ({
            id: `youtube_req${i}`,
            isChecked: true,
            requestedById: "user1",
            title: `youtube_req${i}`,
            sourceId: `youtube_req${i}`,
            thumbnailUrl: "thumbnail",
          })),
        }),
        prisma.videoEvent.createMany({
          data: [
            {
              id: "1_1",
              type: "REGISTER",
              userId: "user1",
              videoId: "video1",
              createdAt: new Date("2021-01-30T00:00:00.000Z"),
              payload: {},
            },
            {
              id: "1_2",
              type: "REGISTER",
              userId: "user1",
              videoId: "video2",
              createdAt: new Date("2021-01-29T00:00:00.000Z"),
              payload: {},
            },
            {
              id: "1_3",
              type: "REGISTER",
              userId: "user1",
              videoId: "video3",
              createdAt: new Date("2021-01-28T00:00:00.000Z"),
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
              createdAt: new Date("2021-01-30T01:00:00.000Z"),
            },
            {
              id: "2_2",
              type: "REQUEST",
              requestId: "nicovideo_req2",
              userId: "user1",
              createdAt: new Date("2021-01-29T01:00:00.000Z"),
            },
            {
              id: "2_3",
              type: "REQUEST",
              requestId: "nicovideo_req3",
              userId: "user1",
              createdAt: new Date("2021-01-28T01:00:00.000Z"),
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
              createdAt: new Date("2021-01-30T02:00:00.000Z"),
            },
            {
              id: "3_2",
              type: "REQUEST",
              requestId: "youtube_req2",
              userId: "user1",
              createdAt: new Date("2021-01-29T02:00:00.000Z"),
            },
            {
              id: "3_3",
              type: "REQUEST",
              requestId: "youtube_req3",
              userId: "user1",
              createdAt: new Date("2021-01-28T02:00:00.000Z"),
            },
          ],
        }),
      ]);

      const actual = await service.calcTimelineEvents("user1", {
        take: 3,
        skip: 3,
        filter: { REGISTER: true, REQUEST_NICOVIDEO: true, REQUEST_YOUTUBE: true },
      });
      expect(actual.length).toBe(3);

      const acutal0 = actual[0] as YoutubeMadRequestedTimelineEventDTO;
      expect(acutal0.createdAt).toStrictEqual(new Date("2021-01-29T02:00:00.000Z"));
      expect(acutal0.requestId).toBe("youtube_req2");
      expect(acutal0.eventId).toBe("3_2");

      const acutal1 = actual[1] as NicovideoMadRequestedTimelineEventDTO;
      expect(acutal1.createdAt).toStrictEqual(new Date("2021-01-29T01:00:00.000Z"));
      expect(acutal1.requestId).toBe("nicovideo_req2");
      expect(acutal1.eventId).toBe("2_2");

      const acutal2 = actual[2] as MadRegisteredTimelineEventDTO;
      expect(acutal2.createdAt).toStrictEqual(new Date("2021-01-29T00:00:00.000Z"));
      expect(acutal2.videoId).toBe("video2");
      expect(acutal2.eventId).toBe("1_2");

      const actualCached = await redis
        .get(`timeline:user1:${JSON.stringify({ REGISTER: true, REQUEST_NICOVIDEO: true, REQUEST_YOUTUBE: true })}`)
        .then((v) => JSON.parse(v ?? "[]"));
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
