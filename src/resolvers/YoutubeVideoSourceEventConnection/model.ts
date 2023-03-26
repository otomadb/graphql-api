import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeVideoSourceEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class YoutubeVideoSourceEventConnectionModel extends AbstractConnectionModel<YoutubeVideoSourceEvent> {
  static fromPrisma(conn: Connection<YoutubeVideoSourceEvent, Edge<YoutubeVideoSourceEvent>>) {
    return new YoutubeVideoSourceEventConnectionModel(conn);
  }
}
