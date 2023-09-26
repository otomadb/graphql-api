import { SoundcloudVideoSourceEvent } from "@prisma/client";

export class SoundcloudMADSourceEventDTO {
  constructor(protected readonly event: SoundcloudVideoSourceEvent) {}

  public static fromPrisma(source: SoundcloudVideoSourceEvent) {
    return new SoundcloudMADSourceEventDTO(source);
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
