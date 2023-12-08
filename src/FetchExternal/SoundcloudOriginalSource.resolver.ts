import { MkResolver } from "../utils/MkResolver.js";

export const mkSoundcloudOriginalSourceResolver: MkResolver<"SoundcloudOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => ({
  title: ({ title }) => title,
  sourceId: ({ sourceId }) => sourceId,
  thumbnailUrl: ({ originalThumbnailUrl, userAvatarUrl }, { scale }) =>
    ImagesService.proxyThis(originalThumbnailUrl || userAvatarUrl, scale),
  originalThumbnailUrl: ({ originalThumbnailUrl, userAvatarUrl }) => originalThumbnailUrl || userAvatarUrl,
  url: ({ url }) => url,
});
