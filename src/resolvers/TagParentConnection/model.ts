import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { TagParent } from "@prisma/client";

import { AbstractConnectionModel } from "../connection.js";

export class TagParentConnectionModel extends AbstractConnectionModel<TagParent> {
  static fromPrisma(conn: Connection<TagParent, Edge<TagParent>>) {
    return new TagParentConnectionModel(conn);
  }
}
