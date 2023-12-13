import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Notification } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class NotificationConnectionDTO extends AbstractConnectionModel<Notification> {
  static fromPrisma(conn: Connection<Notification, Edge<Notification>>) {
    return new NotificationConnectionDTO(conn);
  }
}
