import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { dataSource } from "../../db/data-source.js";
import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../db/entities/mylists.js";
import { MutationResolvers, MylistShareRange as MylistGQLShareRange } from "../../graphql/resolvers.js";
import { MylistModel } from "../../models/mylist.js";

export const createMylist: MutationResolvers["createMylist"] = async (_parent, { input }, { user }) => {
  if (!user) throw new GraphQLError("need to authenticate");
  const mylist = new Mylist();
  mylist.id = ulid();
  mylist.title = input.title;
  if (input.range === MylistGQLShareRange.Public) {
    mylist.range = MylistEntityShareRange.PUBLIC;
  } else if (input.range === MylistGQLShareRange.KnowLink) {
    mylist.range = MylistEntityShareRange.KNOW_LINK;
  } else if (input.range === MylistGQLShareRange.Private) {
    mylist.range = MylistEntityShareRange.PRIVATE;
  } else {
    throw new GraphQLError("unknown share range");
  }
  mylist.holder = user;
  mylist.isLikeList = false;

  await dataSource.getRepository(Mylist).insert(mylist);

  return {
    mylist: new MylistModel(mylist),
  };
};
