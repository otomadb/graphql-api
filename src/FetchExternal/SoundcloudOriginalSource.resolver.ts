import { MkResolver } from "../utils/MkResolver.js";

export const mkSoundcloudOriginalSourceResolver: MkResolver<"SoundcloudOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => ({
  title: ({ title }) => title,
  sourceId: ({ sourceId }) => sourceId,
  thumbnailUrl: ({ url }, { scale }) => ImagesService.getOriginalSoundcloudUrl(url, scale),
  originalThumbnailUrl: ({ originalThumbnailUrl }) => {
    const img = originalThumbnailUrl?.replace("-large.jpg", "-t500x500.jpg");
    if (img) return img;
    return null;
  },
  url: ({ url }) => url,
});
