import { VideoTagEvent } from "@prisma/client";

export class VideoTagEventModel {
  constructor(protected readonly event: VideoTagEvent) {}

  get id() {
    return this.event.id;
  }

  get userId() {
    return this.event.userId;
  }

  get videoTagId() {
    return this.event.videoTagId;
  }

  get type() {
    return this.event.type;
  }
}
