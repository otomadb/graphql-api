import { VideoEvent } from "@prisma/client";

export abstract class VideoEventModel<TPayload = unknown> {
  constructor(protected readonly event: VideoEvent) {}

  get id() {
    return this.event.id;
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

  abstract get payload(): TPayload;
}
