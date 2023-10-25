import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { Logger } from "pino";
import z from "zod";

import {
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  SoundcloudMadRequestedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
} from "./TimelineEvent.dto.js";

export type RegisterVideoCache = { type: "REGISTER"; videoId: string; createdAt: Date; eventId: string };
export type RequestNicovideoCache = { type: "REQUEST_NICOVIDEO"; requestId: string; createdAt: Date; eventId: string };
export type RequestYoutubeCache = { type: "REQUEST_YOUTUBE"; requestId: string; createdAt: Date; eventId: string };
export type RequestSoundcloudCache = {
  type: "REQUEST_SOUNDCLOUD";
  requestId: string;
  createdAt: Date;
  eventId: string;
};
export type Cache = RegisterVideoCache | RequestNicovideoCache | RequestYoutubeCache | RequestSoundcloudCache;

export const mkTimelineEventService = ({
  prisma,
  redis,
  logger,
}: {
  prisma: PrismaClient;
  redis: Redis;
  logger: Logger;
}) => {
  return {
    async calcTimelineEvents(
      userId: string,
      { take, skip, filter }: { take: number; skip: number; filter: Record<Cache["type"], boolean> },
    ): Promise<
      (MadRegisteredTimelineEventDTO | NicovideoMadRequestedTimelineEventDTO | YoutubeMadRequestedTimelineEventDTO)[]
    > {
      const redisKey = `timeline:${userId}:${JSON.stringify(filter)}`;
      const cached = await redis.get(redisKey).then((v) => JSON.parse(v ?? "[]"));
      const parsedCached = z
        .array(
          z.union([
            z.object({
              type: z.literal("REGISTER"),
              createdAt: z.string().datetime(),
              videoId: z.string(),
              eventId: z.string(),
            }),
            z.object({
              type: z.literal("REQUEST_NICOVIDEO"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
              eventId: z.string(),
            }),
            z.object({
              type: z.literal("REQUEST_YOUTUBE"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
              eventId: z.string(),
            }),
            z.object({
              type: z.literal("REQUEST_SOUNDCLOUD"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
              eventId: z.string(),
            }),
          ]),
        )
        .safeParse(cached);

      if (parsedCached.success) {
        const lack = skip + take - cached.length;
        if (lack <= 0)
          return parsedCached.data.slice(skip, skip + take).map(({ createdAt, ...v }) => {
            switch (v.type) {
              case "REGISTER":
                return new MadRegisteredTimelineEventDTO(createdAt, v);
              case "REQUEST_NICOVIDEO":
                return new NicovideoMadRequestedTimelineEventDTO(createdAt, v);
              case "REQUEST_YOUTUBE":
                return new YoutubeMadRequestedTimelineEventDTO(createdAt, v);
              case "REQUEST_SOUNDCLOUD":
                return new SoundcloudMadRequestedTimelineEventDTO(createdAt, v);
            }
          });
      } else {
        logger.warn(parsedCached.error);
      }

      const [v, nr, yr, sr] = await prisma.$transaction([
        prisma.videoEvent.findMany({
          where: { type: "REGISTER" },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.nicovideoRegistrationRequestEvent.findMany({
          where: { type: "REQUEST", request: { isChecked: false } },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.youtubeRegistrationRequestEvent.findMany({
          where: { type: "REQUEST", request: { isChecked: false } },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.soundcloudRegistrationRequestEvent.findMany({
          where: { type: "REQUEST", request: { isChecked: false } },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
      ]);
      const merged = [
        ...v.map(
          ({ createdAt, videoId, id }) =>
            ({
              type: "REGISTER" as const,
              videoId,
              createdAt,
              eventId: id,
            }) satisfies RegisterVideoCache,
        ),
        ...nr.map(
          ({ createdAt, requestId, id }) =>
            ({
              type: "REQUEST_NICOVIDEO" as const,
              requestId,
              createdAt,
              eventId: id,
            }) satisfies RequestNicovideoCache,
        ),
        ...yr.map(
          ({ createdAt, requestId, id }) =>
            ({
              type: "REQUEST_YOUTUBE" as const,
              requestId,
              createdAt,
              eventId: id,
            }) satisfies RequestYoutubeCache,
        ),
        ...sr.map(
          ({ createdAt, requestId, id }) =>
            ({
              type: "REQUEST_SOUNDCLOUD" as const,
              requestId,
              createdAt,
              eventId: id,
            }) satisfies RequestSoundcloudCache,
        ),
      ]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, skip + take);

      await redis.setex(redisKey, 60 * 15, JSON.stringify(merged));
      return merged.slice(skip).map(({ createdAt, ...v }) => {
        switch (v.type) {
          case "REGISTER":
            return new MadRegisteredTimelineEventDTO(createdAt, v);
          case "REQUEST_NICOVIDEO":
            return new NicovideoMadRequestedTimelineEventDTO(createdAt, v);
          case "REQUEST_YOUTUBE":
            return new YoutubeMadRequestedTimelineEventDTO(createdAt, v);
          case "REQUEST_SOUNDCLOUD":
            return new SoundcloudMadRequestedTimelineEventDTO(createdAt, v);
        }
      });
    },

    async clearAll() {
      return redis.keys("timeline:*").then((keys) => redis.del(...keys));
    },
  };
};

export type TimelineEventService = ReturnType<typeof mkTimelineEventService>;
