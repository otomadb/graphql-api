import { VideoThumbnail } from "@prisma/client";

export class VideoThumbnailModel {
  constructor(protected readonly videoThumbnail: VideoThumbnail) {}

  get id() {
    return this.videoThumbnail.id;
  }

  get imageUrl() {
    return this.videoThumbnail.imageUrl;
  }

  get primary() {
    return this.videoThumbnail.isPrimary;
  }

  get videoId() {
    return this.videoThumbnail.videoId;
  }
}
