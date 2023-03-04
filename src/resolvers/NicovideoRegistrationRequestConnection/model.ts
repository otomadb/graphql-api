import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { NicovideoRegistrationRequest } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class NicovideoRegistrationRequestConnectionModel extends AbstractConnectionModel<NicovideoRegistrationRequest> {
  static fromPrisma(conn: Connection<NicovideoRegistrationRequest, Edge<NicovideoRegistrationRequest>>) {
    return new NicovideoRegistrationRequestConnectionModel(conn);
  }
}
