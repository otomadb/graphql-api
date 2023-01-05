import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../../db/entities/mylists.js";
import { MutationResolvers, MylistShareRange as MylistGQLShareRange } from "../../../graphql.js";
import { MylistModel } from "../../Mylist/model.js";

export const createMylist = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input: { title, range } }, { user }) => {
    if (!user) throw new GraphQLError("need to authenticate");

    const mylist = new Mylist();

    mylist.id = ulid();
    mylist.title = title;
    switch (range) {
      case MylistGQLShareRange.Public:
        mylist.range = MylistEntityShareRange.PUBLIC;
        break;
      case MylistGQLShareRange.KnowLink:
        mylist.range = MylistEntityShareRange.KNOW_LINK;
        break;
      case MylistGQLShareRange.Private:
        mylist.range = MylistEntityShareRange.PRIVATE;
        break;
    }
    mylist.holder = user;
    mylist.isLikeList = false;

    await dataSource.getRepository(Mylist).insert(mylist);

    return { mylist: new MylistModel(mylist) };
  }) satisfies MutationResolvers["createMylist"];
