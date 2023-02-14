import { VideoEvent } from "@prisma/client";

export class VideoEventModel {
  constructor(protected readonly event: VideoEvent) {}

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

  get videoId() {
    return this.event.videoId;
  }

  get type() {
    return this.event.type;
  }

  get payload() {
    return this.event.payload;
  }
}
