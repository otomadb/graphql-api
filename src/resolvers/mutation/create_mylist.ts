import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../db/entities/mylists.js";
import { MylistModel } from "../../graphql/models.js";
import { MutationResolvers, MylistShareRange as MylistGQLShareRange } from "../../graphql/resolvers.js";
import { createMylist as createMylistInNeo4j } from "../../neo4j/create_mylist.js";

export const createMylist =
  ({ dataSource }: { dataSource: DataSource }): MutationResolvers["createMylist"] =>
  async (_parent, { input }, { user }) => {
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
    await createMylistInNeo4j({
      userId: user.id,
      mylistId: mylist.id,
    });

    return {
      mylist: new MylistModel(mylist),
    };
  };
