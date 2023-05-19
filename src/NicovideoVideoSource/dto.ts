import { NicovideoVideoSource, NicovideoVideoSourceEvent } from "@prisma/client";

export class NicovideoVideoSourceDTO {
  public id;
  public sourceId;
  public videoId;

  constructor(private readonly source: NicovideoVideoSource) {
    this.id = source.id;
    this.sourceId = source.sourceId;
    this.videoId = source.videoId;
  }
}

export class NicovideoVideoSourceEventDTO {
  constructor(protected readonly event: NicovideoVideoSourceEvent) {}

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
