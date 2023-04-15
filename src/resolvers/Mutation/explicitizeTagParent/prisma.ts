import { TagParent } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const explicitize = async (
  prisma: ResolverDeps["prisma"],
  { userId, relationId }: { userId: string; relationId: string }
): Promise<
  Result<
    | { type: "IS_EXPLICIT"; relation: TagParent }
    | { type: "NOT_EXISTS"; id: string }
    | { type: "UNKNOWN"; error: unknown },
    TagParent
  >
> => {
  try {
    const exists = await prisma.tagParent.findUnique({
      where: { id: relationId },
    });
    if (!exists) return err({ type: "NOT_EXISTS", id: relationId });
    if (exists.isExplicit) return err({ type: "IS_EXPLICIT", relation: exists });

    const updated = await prisma.tagParent.update({
      where: { id: exists.id },
      data: {
        isExplicit: true,
        events: { create: { type: "SET_PRIMARY", userId, payload: {} } },
      },
    });
    return ok(updated);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
