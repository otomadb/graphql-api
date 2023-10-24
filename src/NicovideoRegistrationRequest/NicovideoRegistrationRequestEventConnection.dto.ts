import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { NicovideoRegistrationRequestEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class NicovideoRegistrationRequestEventConnectionDTO extends AbstractConnectionModel<NicovideoRegistrationRequestEvent> {
  static fromPrisma(conn: Connection<NicovideoRegistrationRequestEvent, Edge<NicovideoRegistrationRequestEvent>>) {
    return new NicovideoRegistrationRequestEventConnectionDTO(conn);
  }
}
