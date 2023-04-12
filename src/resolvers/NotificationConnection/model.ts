import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Notification } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class NotificationConnectionModel extends AbstractConnectionModel<Notification> {
  static fromPrisma(conn: Connection<Notification, Edge<Notification>>) {
    return new NotificationConnectionModel(conn);
  }
}
