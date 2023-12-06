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
    }: {
      offset: number;
      take: number;
      orderBy: { createdAt?: "desc" | "asc" };
    }) {
      const [count, nodes] = await prisma.$transaction([
        prisma.video.count(),
        prisma.video.findMany({ orderBy, skip: offset, take }),
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
