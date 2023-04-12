import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";

export const getMylist = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) => {
    const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", id) } });

    if (!mylist) {
      logger.error({ path: info.path, args: { id } }, "Not found");
      throw new GraphQLError("Mylist Not Found or Private");
    }
    if (mylist.shareRange === MylistShareRange.PRIVATE && mylist.holderId !== ctxUser?.id) {
      logger.error(
        {
          path: info.path,
          args: { id },
          holderId: mylist.holderId,
          userId: ctxUser?.id,
        },
        "Private mylist accessed by other user"
      );
      throw new GraphQLError("This mylist is not holded by you");
    }

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["getMylist"];
