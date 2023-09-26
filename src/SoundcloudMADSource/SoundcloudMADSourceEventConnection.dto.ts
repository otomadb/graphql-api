import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { SoundcloudVideoSourceEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class SoundcloudMADSourceEventConnectionDTO extends AbstractConnectionModel<SoundcloudVideoSourceEvent> {
  static fromPrisma(conn: Connection<SoundcloudVideoSourceEvent, Edge<SoundcloudVideoSourceEvent>>) {
    return new SoundcloudMADSourceEventConnectionDTO(conn);
  }
}
