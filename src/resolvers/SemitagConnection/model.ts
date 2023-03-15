import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Semitag } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class SemitagConnectionModel extends AbstractConnectionModel<Semitag> {
  static fromPrisma(conn: Connection<Semitag, Edge<Semitag>>) {
    return new SemitagConnectionModel(conn);
  }
}
