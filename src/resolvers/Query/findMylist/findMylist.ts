import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { parseGqlID } from "../../../utils/id.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";

export const MYLIST_NOT_FOUND_OR_PRIVATE_ERROR = "Mylist Not Found or Private";
export const MYLIST_NOT_HOLDED_BY_YOU = "This mylist is not holded by you";

export const findMylist = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: { id } }, { user }) => {
    if (!id) throw new GraphQLError("id must be provided"); // TODO: error messsage

    const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", id) } });

    if (!mylist) return null;
    if (mylist.shareRange === MylistShareRange.PRIVATE && mylist.holderId !== user?.id) return null;

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["findMylist"];
