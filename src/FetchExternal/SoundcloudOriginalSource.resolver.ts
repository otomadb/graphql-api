import { MkResolver } from "../utils/MkResolver.js";

export const mkSoundcloudOriginalSourceResolver: MkResolver<"SoundcloudOriginalSource", "ImagesService"> = ({
  ImagesService,
}) => ({
  title: ({ title }) => title,
  sourceId: ({ sourceId }) => sourceId,
  thumbnailUrl: ({ url }, { scale }) => ImagesService.getOriginalSoundcloudUrl(url, scale),
  originalThumbnailUrl: ({ originalThumbnailUrl }) => originalThumbnailUrl.replace("-large.jpg", "-t500x500.jpg"),
  url: ({ url }) => url,
});
