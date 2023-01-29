import { UserRole } from "@prisma/client";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistGroupModel } from "../../MylistGroup/model.js";

export const createMylistGroup = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input }, { user }) => {
    const group = await prisma.mylistGroup.create({
      data: { title: input.title, holderId: user.id },
    });

    return {
      group: new MylistGroupModel(group),
    };
  }) satisfies MutationResolvers["createMylistGroup"];
