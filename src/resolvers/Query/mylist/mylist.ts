import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";

export const mylist = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }, { userId: authUserId }) => {
    const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", id) } });

    if (!mylist) throw new GraphQLError("Mylist Not Found or Private");
    if (mylist.shareRange === MylistShareRange.PRIVATE && mylist.holderId !== authUserId) {
      throw new GraphQLError("This mylist is not holded by you");
    }

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["mylist"];
