import { DataSource } from "typeorm";

import { MylistGroup } from "../../../db/entities/mylist_group.js";
import { QueryResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError } from "../../../utils/id.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";

export const mylistGroup = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id }) =>
    dataSource
      .getRepository(MylistGroup)
      .findOneByOrFail({ id })
      .then((v) => new MylistGroupModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("MylistGroup", id);
      })) satisfies QueryResolvers["mylistGroup"];
