import { Edge, PageInfo } from "@devoxa/prisma-relay-cursor-connection";

export const cursorOptions = {
  encodeCursor: (cursor: { id: string }) => Buffer.from(JSON.stringify(cursor)).toString("base64url"),
  decodeCursor: (cursor: string) => JSON.parse(Buffer.from(cursor, "base64url").toString("ascii")),
};

export abstract class AbstractConnectionModel<T> {
  constructor(
    protected readonly conn: {
      nodes: T[];
      edges: Edge<T>[];
      pageInfo: PageInfo;
      totalCount: number;
    },
  ) {}

  get nodes(): T[] {
    return this.conn.nodes;
  }

  get edges(): Edge<T>[] {
    return this.conn.edges;
  }

  get pageInfo(): PageInfo {
    return this.conn.pageInfo;
  }

  get totalCount(): number {
    return this.conn.totalCount;
  }
}
