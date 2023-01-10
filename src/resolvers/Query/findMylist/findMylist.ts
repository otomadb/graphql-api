import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { Mylist, MylistShareRange as MylistEntityShareRange } from "../../../db/entities/mylists.js";
import { QueryResolvers } from "../../../graphql.js";
import { parseGqlID } from "../../../utils/id.js";
import { MylistModel } from "../../Mylist/model.js";

export const MYLIST_NOT_FOUND_OR_PRIVATE_ERROR = "Mylist Not Found or Private";
export const MYLIST_NOT_HOLDED_BY_YOU = "This mylist is not holded by you";

export const findMylist = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input: { id } }, { user }) => {
    if (!id) throw new GraphQLError("id must be provided"); // TODO: error messsage

    const mylist = await dataSource.getRepository(Mylist).findOne({
      where: { id: parseGqlID("mylist", id) },
      relations: {
        holder: true,
      },
    });

    console.dir(user);

    if (!mylist) return null;
    if (mylist.range === MylistEntityShareRange.PRIVATE && mylist.holder.id !== user?.id) return null;

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["findMylist"];
