import { MylistShareRange } from "@prisma/client";

import { QueryResolvers } from "../../graphql.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverFindMylist = ({
  prisma,
  logger,
  auth0Management,
}: Pick<ResolverDeps, "prisma" | "logger" | "auth0Management">) =>
  (async (_parent, { input }, { currentUser }, info) => {
    const { pair } = input;

    const holder = (await auth0Management.getUsers({ q: `username:"${pair.holderName}"` })).at(0);
    if (!holder) {
      logger.info({ path: info.path, holderName: pair.holderName }, "Holder not found");
      return null;
    }
    if (!holder.user_id) {
      logger.warn({ path: info.path, requestHolderName: pair.holderName, holder }, "User id not defined");
      return null;
    }

    const mylist = await prisma.mylist.findUnique({
      where: {
        holderId_slug: { slug: input.pair.mylistSlug, holderId: holder.user_id },
      },
    });
    if (!mylist) {
      logger.info({ path: info.path, input: pair, holderId: holder.user_id }, "Mylist not found");
      return null;
    }

    if (mylist.shareRange === MylistShareRange.PRIVATE && mylist.holderId !== currentUser?.id) {
      logger.warn(
        {
          path: info.path,
          input: pair,
          mylistHolderId: mylist.holderId,
          currentUserId: currentUser?.id,
        },
        "Mylist is private"
      );
      return null;
    }

    return new MylistModel(mylist);
  }) satisfies QueryResolvers["findMylist"];
