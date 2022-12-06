import { dataSource } from "../db/data-source.js";
import { Tag } from "../db/entities/tags.js";
import { QueryResolvers } from "../graphql/resolvers.js";
import { TagModel } from "../models/tag.js";

export const getTags: QueryResolvers["tags"] = async (_parent, { input }, _context, _info) => {
  const tags = await dataSource.getRepository(Tag).find({
    take: input?.limit || 0,
    skip: input?.skip || 0,
    order: {
      createdAt: input?.order?.createdAt || undefined,
      updatedAt: input?.order?.updatedAt || undefined,
    },
  });

  return { nodes: tags.map((t) => new TagModel(t)) };
};
