import { MkResolver } from "../utils/MkResolver.js";

export const mkYoutubeOriginalSourceResolver: MkResolver<"YoutubeOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => {
  return {
    sourceId: ({ sourceId }) => sourceId,
    url: ({ sourceId }) => `https://www.nicovideo.jp/watch/${sourceId}`,
    thumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
    originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
    proxiedThumbnailUrl: ({ originalThumbnailUrl }, { scale }) => ImagesService.proxyThis(originalThumbnailUrl, scale),
  };
};
