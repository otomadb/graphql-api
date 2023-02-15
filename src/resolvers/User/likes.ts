import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../utils/Result.js";
import { UserResolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { MylistModel } from "../Mylist/model.js";

export const get = async (
  prisma: ResolverDeps["prisma"],
  { userId, authUserId }: { userId: string; authUserId: string | null }
): Promise<Result<"NO_LIKELIST" | "PRIVATE_NOT_HOLDER", Mylist>> => {
  const mylist = await prisma.mylist.findFirst({ where: { holderId: userId, isLikeList: true } });

  if (!mylist) return err("NO_LIKELIST");
  if (mylist.shareRange !== MylistShareRange.PUBLIC && mylist.holderId !== authUserId) err("PRIVATE_NOT_HOLDER");

  return ok(mylist);
};

export const resolveUserLikes = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: userId }, _args, { user }) => {
    const result = await get(prisma, { userId, authUserId: user?.id || null });

    if (result.status === "error")
      switch (result.error) {
        case "NO_LIKELIST":
          // TODO: logging
          return null;
        case "PRIVATE_NOT_HOLDER":
          return null;
      }

    return new MylistModel(result.data);
  }) satisfies UserResolvers["likes"];
