import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { MylistRegistration } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class MylistRegistrationConnectionModel extends AbstractConnectionModel<MylistRegistration> {
  static fromPrisma(conn: Connection<MylistRegistration, Edge<MylistRegistration>>) {
    return new MylistRegistrationConnectionModel(conn);
  }
}
