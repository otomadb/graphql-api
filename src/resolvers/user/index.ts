import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { MylistModel, UserModel } from "../../graphql/models.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";

export const resolveId = ({ id }: UserModel) => addIDPrefix(ObjectType.User, id);

export const resolveUser = ({ dataSource: ds }: { dataSource: DataSource }): Resolvers["User"] => ({
  id: resolveId,
  favorites: async ({ id: userId }) => {
    const mylist = await ds.getRepository(Mylist).findOne({
      where: { holder: { id: userId }, isLikeList: true },
    });

    if (!mylist) throw new GraphQLError(`User "${userId}" favorites not found`);
    return new MylistModel(mylist);
  },
});
