import { MkResolver } from "../utils/MkResolver.js";

export const mkBilibiliOriginalSourceResolver: MkResolver<"BilibiliOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => ({
  title: ({ title }) => title,
  sourceId: ({ sourceId }) => sourceId,
  tags: ({ tags }) => tags,
  thumbnailUrl: ({ sourceId }, { scale }) => ImagesService.originalBilibili(sourceId, scale),
  originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl,
  url: ({ sourceId }) => `https://www.bilibili.com/video/${sourceId}`,
});
