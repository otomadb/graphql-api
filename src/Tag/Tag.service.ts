import { PrismaClient } from "@prisma/client";

export const mkTagService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    countAll() {
      return prisma.tag.count();
    },
  };
};

export type TagService = ReturnType<typeof mkTagService>;
