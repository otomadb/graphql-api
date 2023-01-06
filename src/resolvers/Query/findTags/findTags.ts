import { DataSource, In } from "typeorm";

import { Tag } from "../../../db/entities/tags.js";
import { QueryResolvers } from "../../../graphql.js";
import { TagModel } from "../../Tag/model.js";

export const findTags = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input }) => {
    const tags = await dataSource.getRepository(Tag).find({
      take: input.limit,
      skip: input.skip,
      order: {
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
      },
      where: {
        ...(input.name ? { tagNames: { name: input.name } } : {}),
        ...(input.parents ? { tagParents: { parent: In(input.parents) } } : {}),
      },
    });

    return { nodes: tags.map((t) => new TagModel(t)) };
  }) satisfies QueryResolvers["findTags"];
