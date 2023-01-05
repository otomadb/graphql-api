import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { MylistGroup } from "../../../db/entities/mylist_group.js";
import { MutationResolvers } from "../../../graphql.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";

export const createMylistGroup = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const group = new MylistGroup();

    group.id = ulid();
    group.title = input.title;
    group.holder = user;

    await dataSource.getRepository(MylistGroup).insert(group);

    return {
      group: new MylistGroupModel(group),
    };
  }) satisfies MutationResolvers["createMylistGroup"];
