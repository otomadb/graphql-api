import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MylistGroup } from "../../../db/entities/mylist_group.js";
import { UserRole } from "../../../db/entities/users.js";
import { MutationResolvers } from "../../../graphql.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";

export const createMylistGroup = ({ dataSource }: { dataSource: DataSource }) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input }, { user }) => {
    const group = new MylistGroup();

    group.id = ulid();
    group.title = input.title;
    group.holder = user;

    await dataSource.getRepository(MylistGroup).insert(group);

    return {
      group: new MylistGroupModel(group),
    };
  }) satisfies MutationResolvers["createMylistGroup"];
