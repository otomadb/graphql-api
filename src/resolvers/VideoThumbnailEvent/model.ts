import { VideoThumbnailEvent } from "@prisma/client";

export class VideoThumbnailEventModel {
  constructor(protected readonly event: VideoThumbnailEvent) {}

  get id() {
    return this.event.id;
  }

  get userId() {
    return this.event.userId;
  }

  get videoThumbnailId() {
    return this.event.videoThumbnailId;
  }

  get type() {
    return this.event.type;
  }
}
