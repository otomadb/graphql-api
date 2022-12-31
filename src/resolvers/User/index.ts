import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { Resolvers, UserResolvers } from "../../graphql.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";

export const resolveId = (({ id }) => addIDPrefix(ObjectType.User, id)) satisfies UserResolvers["id"];

export const resolveUser = ({ dataSource: ds }: { dataSource: DataSource }) =>
  ({
    id: resolveId,
    likes: async ({ id: userId }) => {
      const mylist = await ds.getRepository(Mylist).findOne({
        where: { holder: { id: userId }, isLikeList: true },
      });

      if (!mylist) throw new GraphQLError(`User "${userId}" likes list not found`);
      return new MylistModel(mylist);
    },
  } satisfies Resolvers["User"]);
