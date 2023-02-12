import { VideoTag } from "@prisma/client";

export class VideoTagModel {
  constructor(protected readonly videoThumbnail: VideoTag) {}

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
