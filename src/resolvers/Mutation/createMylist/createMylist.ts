import { GraphQLError } from "graphql";

import { MutationResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";

export const createMylist = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { title, range } }, { user }) => {
    if (!user) throw new GraphQLError("you must be logged in"); // TODO: must be error payload

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
