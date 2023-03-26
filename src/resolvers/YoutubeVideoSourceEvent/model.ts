import { YoutubeVideoSourceEvent } from "@prisma/client";

export class YoutubeVideoSourceEventModel {
  constructor(protected readonly event: YoutubeVideoSourceEvent) {}

  public static fromPrisma(source: YoutubeVideoSourceEvent) {
    return new YoutubeVideoSourceEventModel(source);
  }

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

  get sourceId() {
    return this.event.sourceId;
  }

  get type() {
    return this.event.type;
  }
}
