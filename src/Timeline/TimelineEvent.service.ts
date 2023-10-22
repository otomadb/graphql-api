import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { Logger } from "pino";
import z from "zod";

import {
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
} from "./TimelineEvent.dto.js";

export type RegisterVideoCache = { type: "REGISTER"; videoId: string; createdAt: Date };
export type RequestNicovideoCache = { type: "REQUEST_NICOVIDEO"; requestId: string; createdAt: Date };
export type RequestYoutubeCache = { type: "REQUEST_YOUTUBE"; requestId: string; createdAt: Date };
export type Cache = RegisterVideoCache | RequestNicovideoCache | RequestYoutubeCache;

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
      { take, skip }: { take: number; skip: number },
    ): Promise<
      (MadRegisteredTimelineEventDTO | NicovideoMadRequestedTimelineEventDTO | YoutubeMadRequestedTimelineEventDTO)[]
    > {
      const cached = await redis.get(`timeline:${userId}`).then((v) => JSON.parse(v ?? "[]"));
      const parsedCached = z
        .array(
          z.union([
            z.object({
              type: z.literal("REGISTER"),
              createdAt: z.string().datetime(),
              videoId: z.string(),
            }),
            z.object({
              type: z.literal("REQUEST_NICOVIDEO"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
            }),
            z.object({
              type: z.literal("REQUEST_YOUTUBE"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
            }),
          ]),
        )
        .safeParse(cached);

      if (parsedCached.success) {
        const lack = skip + take - cached.length;
        if (lack < 0)
          return parsedCached.data.slice(skip, skip + take).map(({ createdAt, ...v }) => {
            switch (v.type) {
              case "REGISTER":
                return new MadRegisteredTimelineEventDTO(createdAt, v);
              case "REQUEST_NICOVIDEO":
                return new NicovideoMadRequestedTimelineEventDTO(createdAt, v);
              case "REQUEST_YOUTUBE":
                return new YoutubeMadRequestedTimelineEventDTO(createdAt, v);
            }
          });
      } else {
        logger.warn(parsedCached.error);
      }

      const [v, nr, yr] = await prisma.$transaction([
        prisma.videoEvent.findMany({
          where: { type: "REGISTER" },
          orderBy: { createdAt: "asc" },
          take: take + skip,
        }),
        prisma.nicovideoRegistrationRequestEvent.findMany({
          where: { type: "REQUEST" },
          orderBy: { createdAt: "asc" },
          take: take + skip,
        }),
        prisma.youtubeRegistrationRequestEvent.findMany({
          where: { type: "REQUEST" },
          include: { request: { select: { id: true } } },
          orderBy: { createdAt: "asc" },
          take: take + skip,
        }),
      ]);
      const merged = [
        ...v.map(
          ({ createdAt, videoId }) =>
            ({
              type: "REGISTER" as const,
              videoId,
              createdAt,
            }) satisfies RegisterVideoCache,
        ),
        ...nr.map(
          ({ createdAt, requestId }) =>
            ({
              type: "REQUEST_NICOVIDEO" as const,
              requestId,
              createdAt,
            }) satisfies RequestNicovideoCache,
        ),
        ...yr.map(
          ({ createdAt, requestId }) =>
            ({
              type: "REQUEST_YOUTUBE" as const,
              requestId,
              createdAt,
            }) satisfies RequestYoutubeCache,
        ),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      await redis.setex(`timeline:${userId}`, 60 * 15, JSON.stringify(merged));
      return merged.slice(skip, skip + take).map(({ createdAt, ...v }) => {
        switch (v.type) {
          case "REGISTER":
            return new MadRegisteredTimelineEventDTO(createdAt, v);
          case "REQUEST_NICOVIDEO":
            return new NicovideoMadRequestedTimelineEventDTO(createdAt, v);
          case "REQUEST_YOUTUBE":
            return new YoutubeMadRequestedTimelineEventDTO(createdAt, v);
        }
      });
    },

    async clearAll() {
      return redis.keys("timeline:*").then((keys) => redis.del(...keys));
    },
  };
};

export type TimelineEventService = ReturnType<typeof mkTimelineEventService>;
