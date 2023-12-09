import { MkResolver } from "../utils/MkResolver.js";

export const mkBilibiliOriginalSourceResolver: MkResolver<"BilibiliOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => ({
  title: ({ title }) => title,
  sourceId: ({ sourceId }) => sourceId,
  tags: ({ tags }) => tags,

  thumbnailUrl: ({ originalThumbnailUrl }, { scale }) => ImagesService.proxyThis(originalThumbnailUrl, scale),
  proxiedThumbnailUrl: ({ originalThumbnailUrl }, { scale }) => ImagesService.proxyThis(originalThumbnailUrl, scale),

  originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
  url: ({ sourceId }) => `https://www.bilibili.com/video/${sourceId}`,
});
