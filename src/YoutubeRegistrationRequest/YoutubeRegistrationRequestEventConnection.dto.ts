import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeRegistrationRequestEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class YoutubeRegistrationRequestEventConnectionDTO extends AbstractConnectionModel<YoutubeRegistrationRequestEvent> {
  static fromPrisma(conn: Connection<YoutubeRegistrationRequestEvent, Edge<YoutubeRegistrationRequestEvent>>) {
    return new YoutubeRegistrationRequestEventConnectionDTO(conn);
  }
}
