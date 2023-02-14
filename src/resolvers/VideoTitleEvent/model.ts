import { VideoTitleEvent } from "@prisma/client";

export class VideoTitleEventModel {
  constructor(protected readonly event: VideoTitleEvent) {}

  get id() {
    return this.event.id;
  }

  get series() {
    return this.id;
  }

  get createdAt() {
    return this.event.createdAt;
  }

  get userId() {
    return this.event.userId;
  }

  get videoTitleId() {
    return this.event.videoTitleId;
  }

  get type() {
    return this.event.type;
  }
}
