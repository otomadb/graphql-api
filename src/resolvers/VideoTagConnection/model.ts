import { Connection, Edge, PageInfo } from "@devoxa/prisma-relay-cursor-connection";
import { VideoTag } from "@prisma/client";

export class VideoTagConnectionModel {
  constructor(
    private readonly conn: {
      nodes: VideoTag[];
      edges: Edge<VideoTag>[];
      pageInfo: PageInfo;
      totalCount: number;
    }
  ) {}

  static fromPrisma(conn: Connection<VideoTag, Edge<VideoTag>>) {
    return new VideoTagConnectionModel(conn);
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
