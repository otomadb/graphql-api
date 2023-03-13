import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Mylist } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class MylistConnectionModel extends AbstractConnectionModel<Mylist> {
  static fromPrisma(conn: Connection<Mylist, Edge<Mylist>>) {
    return new MylistConnectionModel(conn);
  }
}
