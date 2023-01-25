import { ulid } from "ulid";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";
import { UserRole } from ".prisma/client";

export const createMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
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
