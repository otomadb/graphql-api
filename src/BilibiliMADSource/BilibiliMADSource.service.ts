import {
  BilibiliMADSourceEventType,
  PrismaClient,
  SemitagEventType,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { Logger } from "pino";
import { ulid } from "ulid";

import { BilibiliRegistrationRequestService } from "../BilibiliRegistrationRequest/BilibiliRegistrationRequest.service.js";
import { Neo4jService } from "../Neo4j/Neo4j.service.js";
import { TimelineEventService } from "../Timeline/TimelineEvent.service.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";

export const mkBilibiliMADSourceService = ({
  prisma,
  logger,
  Neo4jService: neo4j,
  BilibiliRegistrationRequestService: RequestService,
  TimelineEventService,
}: {
  prisma: PrismaClient;
  logger: Logger;
  Neo4jService: Neo4jService;
  BilibiliRegistrationRequestService: BilibiliRegistrationRequestService;
  TimelineEventService: TimelineEventService;
}) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.bilibiliMADSource
        .findUniqueOrThrow({ where: { id } })
        .then((v) => BilibiliMADSourceDTO.fromPrisma(v));
    },
    getBySourceIdOrThrow(sourceId: string) {
      return prisma.bilibiliMADSource
        .findUniqueOrThrow({ where: { sourceId } })
        .then((v) => BilibiliMADSourceDTO.fromPrisma(v));
    },
    findBySourceId(sourceId: string) {
      return prisma.bilibiliMADSource
        .findFirst({ where: { sourceId } })
        .then((v) => v && BilibiliMADSourceDTO.fromPrisma(v));
    },

    async register(
      {
        primaryTitle,
        primaryThumbnail,
        tagIds,
        semitagNames,
        sourceIds,
        requestId,
      }: {
        primaryTitle: string;
        primaryThumbnail: string;
        tagIds: string[];
        semitagNames: string[];
        sourceIds: string[];
        requestId: string | null;
      },
      userId: string,
    ): Promise<
      Result<
        | { type: "INTERNAL_SERVER_ERROR"; error: unknown }
        | { type: "REQUEST_NOT_FOUND"; requestId: string }
        | { type: "REQUEST_ALREADY_CHECKED"; requestId: string },
        VideoDTO
      >
    > {
      const videoId = ulid();
      const dataTitles = [{ id: ulid(), title: primaryTitle, isPrimary: true }];
      const dataThumbnails = [{ id: ulid(), imageUrl: primaryThumbnail, isPrimary: true }];
      const dataTags = tagIds.map((tagId) => ({ id: ulid(), tagId }));
      const dataSemitags = semitagNames.map((name) => ({ id: ulid(), name, isChecked: false }));
      const dataSources = sourceIds.map((sourceId) => ({ id: ulid(), sourceId }));

      const transactionReq = await RequestService.mkAcceptTransaction(requestId, {
        videoId,
        userId,
      });
      if (isErr(transactionReq)) {
        switch (transactionReq.error.type) {
          case "REQUEST_NOT_FOUND":
            return err({
              type: "REQUEST_NOT_FOUND",
              requestId: transactionReq.error.requestId,
            });
          case "REQUEST_ALREADY_CHECKED":
            return err({
              type: "REQUEST_ALREADY_CHECKED",
              requestId: transactionReq.error.requestId,
            });
          case "INTERNAL_SERVER_ERROR":
            return err({
              type: "INTERNAL_SERVER_ERROR",
              error: transactionReq.error.error,
            });
        }
      }

      try {
        const [video] = await prisma.$transaction([
          prisma.video.create({
            data: {
              id: videoId,
              titles: { createMany: { data: dataTitles } },
              thumbnails: { createMany: { data: dataThumbnails } },
              tags: { createMany: { data: dataTags } },
              semitags: { createMany: { data: dataSemitags } },
              bilibiliSources: { createMany: { data: dataSources } },
            },
            include: {
              tags: true,
            },
          }),
          prisma.videoEvent.createMany({
            data: [
              {
                userId,
                videoId,
                type: VideoEventType.REGISTER,
                payload: {},
              },
            ],
          }),
          prisma.videoTitleEvent.createMany({
            data: [
              ...dataTitles.map(({ id }) => ({
                userId,
                videoTitleId: id,
                type: VideoTitleEventType.CREATE,
                payload: {},
              })),
              {
                userId,
                videoTitleId: dataTitles[0].id,
                type: VideoTitleEventType.SET_PRIMARY,
                payload: {},
              },
            ],
          }),
          prisma.videoThumbnailEvent.createMany({
            data: [
              ...dataThumbnails.map(({ id }) => ({
                userId,
                videoThumbnailId: id,
                type: VideoThumbnailEventType.CREATE,
                payload: {},
              })),
              {
                userId,
                videoThumbnailId: dataThumbnails[0].id,
                type: VideoThumbnailEventType.SET_PRIMARY,
                payload: {},
              },
            ],
          }),
          prisma.videoTagEvent.createMany({
            data: [
              ...dataTags.map(({ id }) => ({
                userId,
                videoTagId: id,
                type: VideoTagEventType.ATTACH,
                payload: {},
              })),
            ],
          }),
          prisma.semitagEvent.createMany({
            data: [
              ...dataSemitags.map(({ id }) => ({
                userId,
                semitagId: id,
                type: SemitagEventType.ATTACH,
                payload: {},
              })),
            ],
          }),
          prisma.bilibiliMADSourceEvent.createMany({
            data: [
              ...dataSources.map(({ id }) => ({
                userId,
                sourceId: id,
                type: BilibiliMADSourceEventType.CREATE,
                payload: {},
              })),
            ],
          }),
          ...transactionReq.data,
        ]);

        // TODO: 非同期で良い
        neo4j.registerVideoTags(video.tags.map((tag) => ({ videoId: tag.videoId, tagId: tag.tagId })));
        TimelineEventService.clearAll();

        return ok(VideoDTO.fromPrisma(video));
      } catch (e) {
        logger.error(e);
        return err({ type: "INTERNAL_SERVER_ERROR", error: e });
      }
    },
  };
};

export type BilibiliMADSourceService = ReturnType<typeof mkBilibiliMADSourceService>;
