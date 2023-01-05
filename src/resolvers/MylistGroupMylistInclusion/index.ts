import { DataSource } from "typeorm";

import { MylistGroupMylistInclusion } from "../../db/entities/mylist_group.js";
import { Resolvers } from "../../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { MylistGroupModel } from "../MylistGroup/model.js";

export const resolveMylistGroupMylistInclusion = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroupMylistInclusion", id),
    mylist: async ({ id }) =>
      dataSource
        .getRepository(MylistGroupMylistInclusion)
        .findOneOrFail({ where: { id }, relations: { mylist: true } })
        .then((v) => new MylistModel(v.mylist))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("mylist", id);
        }),
    group: async ({ id }) =>
      dataSource
        .getRepository(MylistGroupMylistInclusion)
        .findOneOrFail({ where: { id }, relations: { group: true } })
        .then((v) => new MylistGroupModel(v.group))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("MylistGroup", id);
        }),
  } satisfies Resolvers["MylistGroupMylistInclusion"]);
