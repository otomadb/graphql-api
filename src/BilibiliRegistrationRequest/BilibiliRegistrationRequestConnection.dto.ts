import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { BilibiliRegistrationRequest } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class BilibiliRegistrationRequestConnectionDTO extends AbstractConnectionModel<BilibiliRegistrationRequest> {
  static fromPrisma(conn: Connection<BilibiliRegistrationRequest, Edge<BilibiliRegistrationRequest>>) {
    return new BilibiliRegistrationRequestConnectionDTO(conn);
  }
}
