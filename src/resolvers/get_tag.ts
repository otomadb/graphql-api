import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { QueryResolvers } from "../graphql/resolvers.js";
import { TagModel } from "../models/tag.js";
import { ObjectType, removeIDPrefix } from "../utils/id.js";

export const getTag: QueryResolvers["tag"] = async (_parent, { id }, _context, _info) => {
  const tag = await dataSource.getRepository(Tag).findOne({
    where: { id: removeIDPrefix(ObjectType.Tag, id) },
  });
  if (!tag) throw new GraphQLError("Not Found");

  return new TagModel(tag);
};
