import { Connection, Edge, PageInfo } from "@devoxa/prisma-relay-cursor-connection";
import { Video } from "@prisma/client";

export class VideoConnectionModel {
  constructor(
    private readonly conn: {
      nodes: Video[];
      edges: Edge<Video>[];
      pageInfo: PageInfo;
      totalCount: number;
    }
  ) {}

  static fromPrisma(conn: Connection<Video, Edge<Video>>) {
    return new VideoConnectionModel(conn);
  }

  get nodes() {
    return this.conn.nodes;
  }

  get edges() {
    return this.conn.edges;
  }

  get pageInfo() {
    return this.conn.pageInfo;
  }

  get totalCount() {
    return this.conn.totalCount;
  }
}
