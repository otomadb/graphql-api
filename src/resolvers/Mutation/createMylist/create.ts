import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const create = async (
  prisma: ResolverDeps["prisma"],
  { userId, title, range }: { userId: string; title: string; range: MylistShareRange }
): Promise<Result<{ message: "INTERNAL_SERVER_ERROR"; error: unknown }, Mylist>> => {
  try {
    const mylist = await prisma.mylist.create({
      data: {
        title,
        shareRange: range,
        holderId: userId,
        isLikeList: false,
      },
    });
    return ok(mylist);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
