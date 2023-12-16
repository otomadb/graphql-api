import { PrismaClient } from "@prisma/client";

import { MylistRegistrationModel } from "../resolvers/MylistRegistration/model.js";
import { VideoDTO } from "../Video/dto.js";

export const mkVideoService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow(id: string) {
      return prisma.video.findUniqueOrThrow({ where: { id } }).then((v) => VideoDTO.fromPrisma(v));
    },
    countAll() {
      return prisma.video.count();
    },
    async calcGrowth(dates: Date[]) {
      return prisma
        .$transaction(dates.map((lte) => prisma.video.count({ where: { createdAt: { lte } } })))
        .then((counts) => counts.map((count, i) => ({ count, date: dates[i] })));
    },
    async findByOffset({
      offset,
      take,
      orderBy,
      filter,
    }: {
      offset: number;
      take: number;
      orderBy: {
        createdAt?: "desc" | "asc";
      };
      filter: {
        registeredAtLte: Date | null;
        registeredAtGte: Date | null;
      };
    }) {
      const sf = {
        some: {
          isOriginal: true,
          registeredAt: filter.registeredAtLte
            ? filter.registeredAtGte
              ? { gte: filter.registeredAtGte, lte: filter.registeredAtLte }
              : { lte: filter.registeredAtLte }
            : filter.registeredAtGte
              ? { gte: filter.registeredAtGte }
              : undefined,
        },
      };
      const [count, nodes] = await prisma.$transaction([
        prisma.video.count({
          where: {
            OR: [
              { nicovideoSources: sf },
              // { youtubeSources: sf },
              // { soundcloudSources: sf },
              // { nicovideoSources: sf },
            ],
          },
        }),
        prisma.video.findMany({
          orderBy,
          skip: offset,
          take,
          where: {
            OR: [
              { nicovideoSources: sf },
              // { youtubeSources: sf },
              // { soundcloudSources: sf },
              // { nicovideoSources: sf },
            ],
          },
        }),
      ]);
      return {
        hasMore: offset + take < count,
        totalCount: count,
        nodes: nodes.map((v) => VideoDTO.fromPrisma(v)),
      };
    },
    async findLike({ videoId, holderId }: { videoId: string; holderId: string }) {
      const registration = await prisma.mylistRegistration.findFirst({
        where: { mylist: { slug: "likes", holderId }, videoId, isRemoved: false },
      });
      return registration ? MylistRegistrationModel.fromPrisma(registration) : null;
    },
  };
};

export type VideoService = ReturnType<typeof mkVideoService>;
