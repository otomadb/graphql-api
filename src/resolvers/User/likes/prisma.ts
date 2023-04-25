import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const get = async (
  prisma: ResolverDeps["prisma"],
  { holderId, currentUserId }: { holderId: string; currentUserId: string | null }
): Promise<
  Result<
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown; holderId: string; currentUserId: string | null }
    | { type: "PRIVATE_MYLIST_NOT_AUTH"; mylistId: string }
    | { type: "PRIVATE_MYLIST_WRONG_HOLDER"; mylistId: string; currentUserId: string },
    Mylist
  >
> => {
  try {
    const mylist = await prisma.mylist.upsert({
      where: { holderId_slug: { holderId, slug: "likes" } },
      create: {
        holderId,
        slug: "likes",
        title: "likes",
        shareRange: MylistShareRange.PRIVATE,
      },
      update: {},
    });

    switch (mylist.shareRange) {
      case MylistShareRange.PUBLIC:
        return ok(mylist);
      case MylistShareRange.KNOW_LINK:
      case MylistShareRange.PRIVATE:
        if (!currentUserId) return err({ type: "PRIVATE_MYLIST_NOT_AUTH", mylistId: mylist.id });
        if (mylist.holderId !== currentUserId)
          return err({ type: "PRIVATE_MYLIST_WRONG_HOLDER", mylistId: mylist.id, currentUserId });
        return ok(mylist);
    }
  } catch (error) {
    return err({ type: "INTERNAL_SERVER_ERROR", error, currentUserId, holderId });
  }
};
