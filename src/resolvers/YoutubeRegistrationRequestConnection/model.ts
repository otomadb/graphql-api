import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeRegistrationRequest } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class YoutubeRegistrationRequestConnectionModel extends AbstractConnectionModel<YoutubeRegistrationRequest> {
  static fromPrisma(conn: Connection<YoutubeRegistrationRequest, Edge<YoutubeRegistrationRequest>>) {
    return new YoutubeRegistrationRequestConnectionModel(conn);
  }
}
