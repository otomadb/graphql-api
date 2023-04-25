import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const create = async (
  prisma: ResolverDeps["prisma"],
  { userId, title, range, slug }: { userId: string; title: string; range: MylistShareRange; slug: string }
): Promise<Result<{ message: "INTERNAL_SERVER_ERROR"; error: unknown }, Mylist>> => {
  try {
    const mylist = await prisma.mylist.create({
      data: {
        title,
        slug,
        shareRange: range,
        holderId: userId,
      },
    });
    return ok(mylist);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
