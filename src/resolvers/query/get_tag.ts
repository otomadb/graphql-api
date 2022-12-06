import { GraphQLError } from "graphql";

import { dataSource } from "../../db/data-source.js";
import { Tag } from "../../db/entities/tags.js";
import { TagModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";

export const getTag: QueryResolvers["tag"] = async (_parent, { id }) => {
  const tag = await dataSource.getRepository(Tag).findOne({
    where: { id: removeIDPrefix(ObjectType.Tag, id) },
  });
  if (!tag) throw new GraphQLError("Not Found");

  return new TagModel(tag);
};
