import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist, MylistShareRange } from "../../db/entities/mylists.js";
import { UserResolvers } from "../../graphql.js";
import { MylistModel } from "../Mylist/model.js";

export const resolveUserLikes = ({ dataSource }: { dataSource: DataSource }) =>
  (async ({ id: userId }, _args, { user: authUser }) => {
    const mylist = await dataSource
      .getRepository(Mylist)
      .findOne({ where: { holder: { id: userId }, isLikeList: true } });

    // 無いということは有り得ない．upsertにしても良い気はする
    if (!mylist) throw new GraphQLError(`User "${userId}" likes list not found`);

    // 現状ではnullを返すが何らかのエラー型のunionにしても良い気がする
    if (mylist.range !== MylistShareRange.PUBLIC && authUser?.id !== userId) return null;

    return new MylistModel(mylist);
  }) satisfies UserResolvers["likes"];
