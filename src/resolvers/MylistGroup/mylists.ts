import { DataSource } from "typeorm";

import { MylistGroupMylistInclusion } from "../../db/entities/mylist_group.js";
import { MylistGroupResolvers } from "../../graphql.js";
import { MylistGroupMylistInclusionModel } from "../MylistGroupMylistInclusion/model.js";

export const resolveMylists = ({ dataSource }: { dataSource: DataSource }) =>
  (async ({ id }, { input }) => {
    const inclusions = await dataSource.getRepository(MylistGroupMylistInclusion).find({
      where: { group: { id } },
      relations: { mylist: true },
      take: input.limit,
      skip: input.skip,
      order: {
        createdAt: input.order.createdAt || undefined,
        updatedAt: input.order.updatedAt || undefined,
      },
    });

    const nodes = inclusions.map((i) => new MylistGroupMylistInclusionModel(i));

    return { nodes };
  }) satisfies MylistGroupResolvers["mylists"];
