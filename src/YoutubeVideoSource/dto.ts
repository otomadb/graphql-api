import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeVideoSourceEvent } from "@prisma/client";
import { YoutubeVideoSource } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class YoutubeVideoSourceDTO {
  private constructor(private readonly source: { id: string; sourceId: string; videoId: string }) {}

  public static fromPrisma(source: YoutubeVideoSource) {
    return new YoutubeVideoSourceDTO(source);
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

export class YoutubeVideoSourceEventDTO {
  constructor(protected readonly event: YoutubeVideoSourceEvent) {}

  public static fromPrisma(source: YoutubeVideoSourceEvent) {
    return new YoutubeVideoSourceEventDTO(source);
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

export class YoutubeVideoSourceEventConnectionDTO extends AbstractConnectionModel<YoutubeVideoSourceEvent> {
  static fromPrisma(conn: Connection<YoutubeVideoSourceEvent, Edge<YoutubeVideoSourceEvent>>) {
    return new YoutubeVideoSourceEventConnectionDTO(conn);
  }
}
