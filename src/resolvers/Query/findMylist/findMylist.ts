import { MylistShareRange } from "@prisma/client";
import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";

export const MYLIST_NOT_FOUND_OR_PRIVATE_ERROR = "Mylist Not Found or Private";
export const MYLIST_NOT_HOLDED_BY_YOU = "This mylist is not holded by you";

export const findMylist = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { id } }, { currentUser: ctxUser }, info) => {
    if (!id) {
      logger.error({ path: info.path, args: { input: { id } }, userId: ctxUser?.id }, "Not found");
      throw new GraphQLError("id must be provided"); // TODO: error messsage
    }

    const mylist = await prisma.mylist.findFirst({ where: { id: parseGqlID("Mylist", id) } });

    if (!mylist) {
      logger.warn({ path: info.path, args: { input: { id } }, userId: ctxUser?.id }, "Not found");
      return null;
    }
    if (mylist.shareRange === MylistShareRange.PRIVATE && mylist.holderId !== ctxUser?.id) {
      logger.warn(
        {
          path: info.path,
          args: { input: { id } },
          holderId: mylist.holderId,
          userId: ctxUser?.id,
        },
        "Private mylist accessed by other user"
      );
      return null;
    }

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["findMylist"];
