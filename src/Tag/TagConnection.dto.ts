import { Connection, Edge } from "@devoxa/prisma-relay-cursor-connection";
import { Tag } from "@prisma/client";

import { AbstractConnectionModel } from "../resolvers/connection.js";

export class TagConnectionDTO extends AbstractConnectionModel<Tag> {
  static fromPrisma(conn: Connection<Tag, Edge<Tag>>) {
    return new TagConnectionDTO(conn);
  }
}
