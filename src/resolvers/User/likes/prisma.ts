import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const get = async (
  prisma: ResolverDeps["prisma"],
  { holderId, authUserId }: { holderId: string; authUserId: string | null }
): Promise<Result<"NO_LIKELIST" | "PRIVATE_NOT_HOLDER", Mylist>> => {
  const mylist = await prisma.mylist.findFirst({ where: { holderId, isLikeList: true } });

  if (!mylist) return err("NO_LIKELIST");

  if (mylist.shareRange !== MylistShareRange.PUBLIC && (!authUserId || mylist.holderId !== authUserId))
    return err("PRIVATE_NOT_HOLDER");

  return ok(mylist);
};
