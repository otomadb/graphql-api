import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { SoundcloudRegistrationRequestEvent } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class SoundcloudRegistrationRequestEventConnectionDTO extends AbstractConnectionModel<SoundcloudRegistrationRequestEvent> {
  static fromPrisma(conn: Connection<SoundcloudRegistrationRequestEvent, Edge<SoundcloudRegistrationRequestEvent>>) {
    return new SoundcloudRegistrationRequestEventConnectionDTO(conn);
  }
}
