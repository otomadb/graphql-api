import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { SoundcloudRegistrationRequest } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class SoundcloudRegistrationRequestConnectionDTO extends AbstractConnectionModel<SoundcloudRegistrationRequest> {
  static fromPrisma(conn: Connection<SoundcloudRegistrationRequest, Edge<SoundcloudRegistrationRequest>>) {
    return new SoundcloudRegistrationRequestConnectionDTO(conn);
  }
}
