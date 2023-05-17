import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { SoundcloudVideoSourceEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class SoundcloudVideoSourceEventConnectionModel extends AbstractConnectionModel<SoundcloudVideoSourceEvent> {
  static fromPrisma(conn: Connection<SoundcloudVideoSourceEvent, Edge<SoundcloudVideoSourceEvent>>) {
    return new SoundcloudVideoSourceEventConnectionModel(conn);
  }
}
