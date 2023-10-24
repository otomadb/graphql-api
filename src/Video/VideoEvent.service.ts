import { PrismaClient } from "@prisma/client";

import { VideoEventDTO } from "./dto.js";

export const mkVideoEventService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    getByIdOrThrow: async (id: string) =>
      prisma.videoEvent.findUniqueOrThrow({ where: { id } }).then((v) => {
        return new VideoEventDTO(v);
      }),
  };
};
export type VideoEventService = ReturnType<typeof mkVideoEventService>;
