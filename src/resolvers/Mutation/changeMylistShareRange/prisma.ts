import { Mylist, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const update = async (
  prisma: ResolverDeps["prisma"],
  { userId, mylistId, range }: { userId: string; mylistId: string; range: MylistShareRange },
): Promise<
  Result<
    | { message: "MYLIST_NOT_FOUND"; mylistId: string }
    | { message: "MYLIST_WRONG_HOLDER"; mylistId: string }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    Mylist
  >
> => {
  try {
    const exists = await prisma.mylist.findUnique({ where: { id: mylistId } });
    if (!exists) return err({ message: "MYLIST_NOT_FOUND", mylistId });
    if (exists.holderId !== userId) return err({ message: "MYLIST_WRONG_HOLDER", mylistId });

    const updated = await prisma.mylist.update({
      where: { id: mylistId },
      data: { shareRange: range },
    });
    return ok(updated);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
