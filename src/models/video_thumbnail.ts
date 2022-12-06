import { VideoThumbnailResolvers } from "~/codegen/resolvers.js";
import { VideoThumbnail } from "~/db/entities/video_thumbnails.js";

export class VideoThumbnailModel implements VideoThumbnailResolvers {
  constructor(private readonly videoThumbnail: VideoThumbnail) {}

  imageUrl() {
    return this.videoThumbnail.imageUrl;
  }

  primary() {
    return this.videoThumbnail.primary;
  }
}
