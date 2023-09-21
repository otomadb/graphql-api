import { buildGqlId } from "../resolvers/id.js";
import { MkResolver } from "../utils/MkResolver.js";
import { VideoDTO } from "../Video/dto.js";

export const resolverBilibiliMADSource: MkResolver<"BilibiliMADSource", "prisma"> = ({ prisma }) => {
  return {
    id: ({ id }) => buildGqlId("BilibiliMADSource", id),
    sourceId: ({ sourceId }) => sourceId,
    url: ({ sourceId }) => `https://www.bilibili.com/video/${sourceId}`,
    embedUrl: ({ sourceId }) => `https://player.bilibili.com/player.html?bvid=${sourceId}`,
    video: ({ videoId }) => VideoDTO.getPrismaClientById(prisma, videoId),
  };
};
