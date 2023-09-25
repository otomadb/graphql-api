import {
  BilibiliMADSourceEventType,
  PrismaClient,
  SemitagEventType,
  VideoEventType,
  VideoTagEventType,
  VideoThumbnailEventType,
  VideoTitleEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { Neo4jService } from "../Neo4j/Neo4j.service.js";
import { ok, Result } from "../utils/Result.js";
import { VideoDTO } from "../Video/dto.js";
import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";

export const mkBilibiliMADSourceService = ({
  prisma,
  Neo4jService: neo4j,
}: {
  prisma: PrismaClient;
  Neo4jService: Neo4jService;
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
      ]);

      await neo4j.registerVideoTags(video.tags.map((tag) => ({ videoId: tag.videoId, tagId: tag.tagId })));

      return ok(VideoDTO.fromPrisma(video));
    },
  };
};

export type BilibiliMADSourceService = ReturnType<typeof mkBilibiliMADSourceService>;
