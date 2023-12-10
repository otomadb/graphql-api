import { PrismaClient } from "@prisma/client";

import { VideoTagDTO } from "../Video/dto.js";

export const mkTagService = ({ prisma }: { prisma: PrismaClient }) => {
  return {
    countAll() {
      return prisma.tag.count({ where: { disabled: false } });
    },
    async totalTaggedVideos(tagId: string) {
      return prisma.videoTag.count({ where: { tagId } });
    },
    async taggedVideosByOffset(
      tagId: string,
      { offset, take, orderBy }: { offset: number; take: number; orderBy: { createdAt?: "desc" | "asc" } },
    ) {
      const [count, nodes] = await prisma.$transaction([
        prisma.videoTag.count({ where: { tagId } }),
        prisma.videoTag.findMany({ where: { tagId }, orderBy, skip: offset, take }),
      ]);
      return {
        hasMore: offset + take < count,
        totalCount: count,
        nodes: nodes.map((v) => new VideoTagDTO(v)),
      };
    },
  };
};

export type TagService = ReturnType<typeof mkTagService>;
