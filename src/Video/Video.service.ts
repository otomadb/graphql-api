import { PrismaClient } from "@prisma/client";

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
  };
};

export type VideoService = ReturnType<typeof mkVideoService>;
