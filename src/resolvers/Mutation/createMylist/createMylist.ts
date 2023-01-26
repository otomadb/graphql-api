import { UserRole } from "@prisma/client";

import { checkAuth } from "../../../auth/checkAuth.js";
import { MutationResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";

export const createMylist = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  checkAuth(UserRole.NORMAL, async (_parent, { input: { title, range } }, { user }) => {
    const mylist = await prisma.mylist.create({
      data: {
        title,
        shareRange: range,
        holderId: user.id,
        isLikeList: false,
      },
    });
    return { mylist: new MylistModel(mylist) };
  }) satisfies MutationResolvers["createMylist"];
