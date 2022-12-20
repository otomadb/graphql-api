import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Tag } from "../../db/entities/tags.js";
import { QueryResolvers } from "../../graphql.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";
import { TagModel } from "../Tag/model.js";

export const getTag =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["tag"] =>
  async (_parent, { id }) => {
    const tag = await dataSource.getRepository(Tag).findOne({
      where: { id: removeIDPrefix(ObjectType.Tag, id) },
    });
    if (!tag) throw new GraphQLError("Not Found");

    return new TagModel(tag);
  };
