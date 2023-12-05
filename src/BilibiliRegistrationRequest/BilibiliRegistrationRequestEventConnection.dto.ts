import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { BilibiliRegistrationRequestEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class BilibiliRegistrationRequestEventConnectionDTO extends AbstractConnectionModel<BilibiliRegistrationRequestEvent> {
  static fromPrisma(conn: Connection<BilibiliRegistrationRequestEvent, Edge<BilibiliRegistrationRequestEvent>>) {
    return new BilibiliRegistrationRequestEventConnectionDTO(conn);
  }
}
