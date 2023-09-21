import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { BilibiliMADSourceEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class BilibiliMADSourceEventConnectionDTO extends AbstractConnectionModel<BilibiliMADSourceEvent> {
  static fromPrisma(conn: Connection<BilibiliMADSourceEvent, Edge<BilibiliMADSourceEvent>>) {
    return new BilibiliMADSourceEventConnectionDTO(conn);
  }
}
