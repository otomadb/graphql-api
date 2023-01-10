import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Tag } from "../../../db/entities/tags.js";
import { QueryResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { TagModel } from "../../Tag/model.js";

export const tag = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id }) => {
    const tag = await dataSource.getRepository(Tag).findOne({
      where: { id: parseGqlID("tag", id) },
    });
    if (!tag) throw new GraphQLError("Not Found");

    return new TagModel(tag);
  }) satisfies QueryResolvers["tag"];
