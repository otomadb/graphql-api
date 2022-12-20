import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../db/entities/mylists.js";
import { QueryResolvers } from "../../graphql.js";
import { ObjectType, removeIDPrefix } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";

export const MYLIST_NOT_FOUND_OR_PRIVATE_ERROR = "Mylist Not Found or Private";
export const MYLIST_NOT_HOLDED_BY_YOU = "This mylist is not holded by you";

export const getMylist = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id }, { user }) => {
    const mylist = await dataSource.getRepository(Mylist).findOne({
      where: { id: removeIDPrefix(ObjectType.Mylist, id) },
      relations: {
        holder: true,
      },
    });

    if (!mylist) throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
    if (mylist.holder.id !== user?.id && mylist.range === MylistEntityShareRange.PRIVATE) {
      throw new GraphQLError(MYLIST_NOT_FOUND_OR_PRIVATE_ERROR);
    }

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["mylist"];
