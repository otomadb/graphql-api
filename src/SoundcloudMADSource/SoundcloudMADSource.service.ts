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
import { isErr, ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { SoundcloudMADSourceDTO } from "./SoundcloudMADSource.dto.js";

export const mkSoundcloudMADSourceService = ({
  prisma,
  Neo4jService: neo4j,
  SoundcloudService: Soundcloud,
  logger,
}: {
  prisma: PrismaClient;
  logger: Logger;
  Neo4jService: Neo4jService;
  SoundcloudService: SoundcloudService;
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
      }: {
        primaryTitle: string;
        primaryThumbnail: string;
        tagIds: string[];
        semitagNames: string[];
        sourceIds: string[];
      },
      userId: string,
    ): Promise<Result<"", VideoDTO>> {
      const videoId = ulid();
      const dataTitles = [{ id: ulid(), title: primaryTitle, isPrimary: true }];
      const dataThumbnails = [{ id: ulid(), imageUrl: primaryThumbnail, isPrimary: true }];
      const dataTags = tagIds.map((tagId) => ({ id: ulid(), tagId }));
      const dataSemitags = semitagNames.map((name) => ({ id: ulid(), name, isChecked: false }));
      const dataSources = sourceIds.map((sourceId) => ({ id: ulid(), sourceId }));

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
      ]);

      await neo4j.registerVideoTags(video.tags.map((tag) => ({ videoId: tag.videoId, tagId: tag.tagId })));

      return ok(VideoDTO.fromPrisma(video));
    },
  };
};

export type SoundcloudMADSourceService = ReturnType<typeof mkSoundcloudMADSourceService>;
