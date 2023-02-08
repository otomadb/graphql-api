import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { UserResolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";

export const resolveUserLikes = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: userId }, _args, { userId: authUserId }) => {
    const mylist = await prisma.mylist
      .findFirstOrThrow({
        where: { holderId: userId, isLikeList: true },
      })
      .catch(() => {
        throw new GraphQLError(`User "${userId}" likes list not found`);
      });

    // 現状ではnullを返すが何らかのエラー型のunionにしても良い気がする
    if (mylist.shareRange !== MylistShareRange.PUBLIC && authUserId !== userId) return null;

    return new MylistModel(mylist);
  }) satisfies UserResolvers["likes"];
