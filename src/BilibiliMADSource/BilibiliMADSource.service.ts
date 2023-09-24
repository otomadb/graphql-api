import { PrismaClient } from "@prisma/client";

import { BilibiliMADSourceDTO } from "./BilibiliMADSource.dto.js";

export const mkBilibiliMADSourceService = ({ prisma }: { prisma: PrismaClient }) => {
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
  };
};
export type BilibiliMADSourceService = ReturnType<typeof mkBilibiliMADSourceService>;
