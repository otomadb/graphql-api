import { GraphQLError } from "graphql";

import { MkResolver } from "../utils/MkResolver.js";
import { NicovideoOriginalSourceTagDTO } from "./NicovideoOriginalSourceTag.dto.js";
export const mkNicovideoOriginalSourceResolver: MkResolver<
  "NicovideoOriginalSource",
  "NicovideoService" | "ImagesService"
> = ({ NicovideoService, ImagesService }) => {
  return {
    sourceId: ({ sourceId }) => sourceId,
    url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    embedUrl: ({ sourceId }) => `https://embed.nicovideo.jp/watch/${sourceId}`,
    originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
    proxiedThumbnailUrl: ({ originalThumbnailUrl }, { scale }) => ImagesService.proxyThis(originalThumbnailUrl, scale),
    async info({ sourceId }) {
      const info = await NicovideoService.getFreshInfo(sourceId);
      if (!info) throw new GraphQLError("Failed to get fresh info");

      return {
        ...info,
        tags: info.tags.map((tag) => new NicovideoOriginalSourceTagDTO({ name: tag })),
      };
    },
  };
};
