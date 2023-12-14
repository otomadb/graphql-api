import { PrismaClient } from "@prisma/client";
import { Redis } from "ioredis";
import { Logger } from "pino";
import z from "zod";

import {
  BilibiliMadRequestedTimelineEventDTO,
  MadRegisteredTimelineEventDTO,
  NicovideoMadRequestedTimelineEventDTO,
  SoundcloudMadRequestedTimelineEventDTO,
  YoutubeMadRequestAcceptedTimelineEventDTO,
  YoutubeMadRequestedTimelineEventDTO,
  YoutubeMadRequestRejectedTimelineEventDTO,
  YoutubeMadRequestResolvedTimelineEventDTO,
} from "./TimelineEvent.dto.js";

export type RegisterVideoCache = {
  type: "REGISTER";
  videoId: string;
  createdAt: Date;
  eventId: string;
};
export type RequestNicovideoCache = {
  type: "REQUEST_NICOVIDEO";
  requestId: string;
  createdAt: Date;
  eventId: string;
};
export type RequestYoutubeCache = {
  type: "REQUEST_YOUTUBE";
  requestId: string;
  createdAt: Date;
};

export const schemaAcceptedYoutubeRequestCache = z.object({
  type: z.literal("ACCEPTED_YOUTUBE_REQUEST"),
  createdAt: z.union([z.date(), z.string().datetime()]),
  checkingId: z.string(),
});
export type AcceptedYoutubeRequestCache = z.infer<typeof schemaAcceptedYoutubeRequestCache>;

export const schemaRejectedYoutubeRequestCache = z.object({
  type: z.literal("REJECTED_YOUTUBE_REQUEST"),
  createdAt: z.union([z.date(), z.string().datetime()]),
  checkingId: z.string(),
});
export type RejectedYoutubeRequestCache = z.infer<typeof schemaRejectedYoutubeRequestCache>;

export const schemaResolvedYoutubeRequestCache = z.object({
  type: z.literal("RESOLVED_YOUTUBE_REQUEST"),
  createdAt: z.union([z.date(), z.string().datetime()]),
  checkingId: z.string(),
});
export type ResolvedYoutubeRequestCache = z.infer<typeof schemaResolvedYoutubeRequestCache>;

export type RequestSoundcloudCache = {
  type: "REQUEST_SOUNDCLOUD";
  requestId: string;
  createdAt: Date;
  eventId: string;
};
export type RequestBilibiliCache = {
  type: "REQUEST_BILIBILI";
  requestId: string;
  createdAt: Date;
  eventId: string;
};
export type Cache =
  | RegisterVideoCache
  | RequestNicovideoCache
  | RequestYoutubeCache
  | RequestSoundcloudCache
  | RequestBilibiliCache;
export type Filter = Record<Cache["type"], boolean>;

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
      { take, skip, filter }: { take: number; skip: number; filter: Filter },
    ): Promise<
      (
        | MadRegisteredTimelineEventDTO
        | NicovideoMadRequestedTimelineEventDTO
        | SoundcloudMadRequestedTimelineEventDTO
        | SoundcloudMadRequestedTimelineEventDTO
        | YoutubeMadRequestAcceptedTimelineEventDTO
        | YoutubeMadRequestedTimelineEventDTO
        | YoutubeMadRequestRejectedTimelineEventDTO
        | YoutubeMadRequestResolvedTimelineEventDTO
      )[]
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
            z.object({
              type: z.literal("REQUEST_BILIBILI"),
              createdAt: z.string().datetime(),
              requestId: z.string(),
              eventId: z.string(),
            }),
            schemaAcceptedYoutubeRequestCache,
            schemaRejectedYoutubeRequestCache,
            schemaResolvedYoutubeRequestCache,
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
              case "REQUEST_BILIBILI":
                return new BilibiliMadRequestedTimelineEventDTO(createdAt, v);
              case "ACCEPTED_YOUTUBE_REQUEST":
                return new YoutubeMadRequestAcceptedTimelineEventDTO(createdAt, v);
              case "REJECTED_YOUTUBE_REQUEST":
                return new YoutubeMadRequestRejectedTimelineEventDTO(createdAt, v);
              case "RESOLVED_YOUTUBE_REQUEST":
                return new YoutubeMadRequestResolvedTimelineEventDTO(createdAt, v);
            }
          });
      } else {
        logger.warn(parsedCached.error);
      }

      const [v, nr, sr, br, yr, yrc] = await prisma.$transaction([
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
        prisma.soundcloudRegistrationRequestEvent.findMany({
          where: { type: "REQUEST", request: { isChecked: false } },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.bilibiliRegistrationRequestEvent.findMany({
          where: { type: "REQUEST", request: { isChecked: false } },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.youtubeRegistrationRequest.findMany({
          where: { checking: null },
          orderBy: { createdAt: "desc" },
          take: take + skip,
        }),
        prisma.youtubeRegistrationRequestChecking.findMany({
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
        ...sr.map(
          ({ createdAt, requestId, id }) =>
            ({
              type: "REQUEST_SOUNDCLOUD" as const,
              requestId,
              createdAt,
              eventId: id,
            }) satisfies RequestSoundcloudCache,
        ),
        ...br.map(
          ({ createdAt, requestId, id }) =>
            ({
              type: "REQUEST_BILIBILI" as const,
              requestId,
              createdAt,
              eventId: id,
            }) satisfies RequestBilibiliCache,
        ),
        ...yr.map(
          ({ createdAt, id }) =>
            ({
              type: "REQUEST_YOUTUBE" as const,
              createdAt,
              requestId: id,
            }) satisfies RequestYoutubeCache,
        ),
        ...yrc.map(({ createdAt, id: checkingId, videoSourceId, resolved }) => {
          if (videoSourceId === null)
            return {
              type: "REJECTED_YOUTUBE_REQUEST",
              createdAt,
              checkingId,
            } satisfies RejectedYoutubeRequestCache;
          else if (resolved)
            return {
              type: "RESOLVED_YOUTUBE_REQUEST" as const,
              createdAt,
              checkingId,
            } satisfies ResolvedYoutubeRequestCache;
          else
            return {
              type: "ACCEPTED_YOUTUBE_REQUEST" as const,
              createdAt,
              checkingId,
            } satisfies AcceptedYoutubeRequestCache;
        }),
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
          case "ACCEPTED_YOUTUBE_REQUEST":
            return new YoutubeMadRequestAcceptedTimelineEventDTO(createdAt, v);
          case "REJECTED_YOUTUBE_REQUEST":
            return new YoutubeMadRequestRejectedTimelineEventDTO(createdAt, v);
          case "RESOLVED_YOUTUBE_REQUEST":
            return new YoutubeMadRequestResolvedTimelineEventDTO(createdAt, v);
          case "REQUEST_SOUNDCLOUD":
            return new SoundcloudMadRequestedTimelineEventDTO(createdAt, v);
          case "REQUEST_BILIBILI":
            return new SoundcloudMadRequestedTimelineEventDTO(createdAt, v);
        }
      });
    },

    async clearAll() {
      try {
        const keys = await redis.keys("timeline:*");
        await redis.del(...keys);
        return;
      } catch (e) {
        logger.error(e);
        return;
      }
    },
  };
};

export type TimelineEventService = ReturnType<typeof mkTimelineEventService>;
