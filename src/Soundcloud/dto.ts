import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { SoundcloudVideoSource, SoundcloudVideoSourceEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class SoundcloudVideoSourceDTO {
  private constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {}

  public static fromPrisma(source: SoundcloudVideoSource) {
    return new SoundcloudVideoSourceDTO(source);
  }

  get id() {
    return this.source.id;
  }

  get sourceId() {
    return this.source.sourceId;
  }

  get videoId() {
    return this.source.videoId;
  }
}

export class SoundcloudVideoSourceEventDTO {
  constructor(protected readonly event: SoundcloudVideoSourceEvent) {}

  public static fromPrisma(source: SoundcloudVideoSourceEvent) {
    return new SoundcloudVideoSourceEventDTO(source);
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

export class SoundcloudVideoSourceEventConnectionDTO extends AbstractConnectionModel<SoundcloudVideoSourceEvent> {
  static fromPrisma(conn: Connection<SoundcloudVideoSourceEvent, Edge<SoundcloudVideoSourceEvent>>) {
    return new SoundcloudVideoSourceEventConnectionDTO(conn);
  }
}
