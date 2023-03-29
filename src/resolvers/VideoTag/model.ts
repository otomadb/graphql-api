import { VideoTag } from "@prisma/client";

export class VideoTagModel {
  constructor(protected readonly videoThumbnail: VideoTag) {}

  public static fromPrisma(videoThumbnail: VideoTag) {
    return new VideoTagModel(videoThumbnail);
  }

  get id() {
    return this.videoThumbnail.id;
  }

  get videoId() {
    return this.videoThumbnail.videoId;
  }

  get tagId() {
    return this.videoThumbnail.tagId;
  }
}
