import { DataSource } from "typeorm";

import { Tag } from "../../db/entities/tags.js";
import { TagModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const getTags =
  ({ ds }: { ds: DataSource }): QueryResolvers["tags"] =>
  async (_parent, { input }) => {
    const tags = await ds.getRepository(Tag).find({
      take: input?.limit || 0,
      skip: input?.skip || 0,
      order: {
        createdAt: input?.order?.createdAt || undefined,
        updatedAt: input?.order?.updatedAt || undefined,
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  };
