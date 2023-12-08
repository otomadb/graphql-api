import {
  PrismaClient,
  SemitagEventType,
  SoundcloudVideoSourceEventType,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { Logger } from "pino";
import { ulid } from "ulid";

import { SoundcloudService } from "../Common/Soundcloud.service.js";
import { Neo4jService } from "../Neo4j/Neo4j.service.js";
import { SoundcloudRegistrationRequestService } from "../SoundcloudRegistrationRequest/SoundcloudRegistrationRequest.service.js";
import { TimelineEventService } from "../Timeline/TimelineEvent.service.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { SoundcloudMADSourceDTO } from "./SoundcloudMADSource.dto.js";

export const mkSoundcloudMADSourceService = ({
  prisma,
  Neo4jService: neo4j,
  SoundcloudService: Soundcloud,
  logger,
  SoundcloudRegistrationRequestService: RequestService,
  TimelineEventService,
}: {
  prisma: PrismaClient;
  logger: Logger;
  Neo4jService: Neo4jService;
  SoundcloudService: SoundcloudService;
  SoundcloudRegistrationRequestService: SoundcloudRegistrationRequestService;
  TimelineEventService: TimelineEventService;
}) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.soundcloudVideoSource
        .findUniqueOrThrow({ where: { id } })
        .then((v) => SoundcloudMADSourceDTO.fromPrisma(v));
    },
    getBySourceIdOrThrow(sourceId: string) {
      return prisma.soundcloudVideoSource
        .findUniqueOrThrow({ where: { sourceId } })
        .then((v) => SoundcloudMADSourceDTO.fromPrisma(v));
    },
    findBySourceId(sourceId: string) {
      return prisma.soundcloudVideoSource
        .findFirst({ where: { sourceId } })
        .then((v) => v && SoundcloudMADSourceDTO.fromPrisma(v));
    },

    async findByUrl(url: string) {
      const a = await Soundcloud.fetchFromUrl(url);
      if (isErr(a)) {
        logger.debug({ url, err: a.error }, "Failed to fetch from Soundcloud");
        throw new Error("Failed to fetch from Soundcloud");
      }

      return prisma.soundcloudVideoSource
        .findFirst({ where: { sourceId: a.data.sourceId } })
        .then((v) => v && SoundcloudMADSourceDTO.fromPrisma(v));
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
        primaryThumbnail: string | null;
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
      const dataThumbnails = primaryThumbnail ? [{ id: ulid(), imageUrl: primaryThumbnail, isPrimary: true }] : [];
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

      const [video] = await prisma.$transaction([
        prisma.video.create({
          data: {
            id: videoId,
            titles: { createMany: { data: dataTitles } },
            thumbnails: { createMany: { data: dataThumbnails } },
            tags: { createMany: { data: dataTags } },
            semitags: { createMany: { data: dataSemitags } },
            soundcloudSources: { createMany: { data: dataSources } },
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
            ...(dataThumbnails.length > 0
              ? [
                  {
                    userId,
                    videoThumbnailId: dataThumbnails[0].id,
                    type: VideoThumbnailEventType.SET_PRIMARY,
                    payload: {},
                  },
                ]
              : []),
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
        prisma.soundcloudVideoSourceEvent.createMany({
          data: [
            ...dataSources.map(({ id }) => ({
              userId,
              sourceId: id,
              payload: {},
              type: SoundcloudVideoSourceEventType.CREATE,
            })),
          ],
        }),
        ...transactionReq.data,
      ]);

      neo4j.registerVideoTags(video.tags.map((tag) => ({ videoId: tag.videoId, tagId: tag.tagId })));
      TimelineEventService.clearAll();

      return ok(VideoDTO.fromPrisma(video));
    },
  };
};

export type SoundcloudMADSourceService = ReturnType<typeof mkSoundcloudMADSourceService>;
