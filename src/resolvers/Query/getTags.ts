import { DataSource } from "typeorm";

import { Tag } from "../../db/entities/tags.js";
import { QueryResolvers } from "../../graphql.js";
import { TagModel } from "../Tag/model.js";

export const getTags =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["tags"] =>
  async (_parent, { input }) => {
    const tags = await dataSource.getRepository(Tag).find({
      take: input.limit,
      skip: input.skip,
      order: {
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  };
