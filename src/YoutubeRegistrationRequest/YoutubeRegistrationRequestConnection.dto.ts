import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { YoutubeRegistrationRequest } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class YoutubeRegistrationRequestConnectionDTO extends AbstractConnectionModel<YoutubeRegistrationRequest> {
  static fromPrisma(conn: Connection<YoutubeRegistrationRequest, Edge<YoutubeRegistrationRequest>>) {
    return new YoutubeRegistrationRequestConnectionDTO(conn);
  }
}
