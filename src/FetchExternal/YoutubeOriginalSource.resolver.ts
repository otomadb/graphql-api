import { MkResolver } from "../utils/MkResolver.js";

export const mkYoutubeOriginalSourceResolver: MkResolver<"YoutubeOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => {
  return {
    sourceId: ({ sourceId }) => sourceId,
    url: ({ sourceId }) => `https://www.youtube.com/watch?v=${sourceId}`,
    thumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
    originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
    proxiedThumbnailUrl: ({ originalThumbnailUrl }, { scale }) => ImagesService.proxyThis(originalThumbnailUrl, scale),
  };
};
