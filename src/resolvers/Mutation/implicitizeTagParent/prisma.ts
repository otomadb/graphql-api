import { TagParent } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const implicitize = async (
  prisma: ResolverDeps["prisma"],
  { userId, relationId }: { userId: string; relationId: string }
): Promise<
  Result<
    | { type: "UNKNOWN"; error: unknown }
    | { type: "NOT_EXISTS"; id: string }
    | { type: "IS_IMPLICIT"; relation: TagParent },
    TagParent
  >
> => {
  try {
    const exists = await prisma.tagParent.findUnique({
      where: { id: relationId },
    });
    if (!exists) return err({ type: "NOT_EXISTS", id: relationId });
    if (!exists.isExplicit) return err({ type: "IS_IMPLICIT", relation: exists });

    const updated = await prisma.tagParent.update({
      where: { id: exists.id },
      data: {
        isExplicit: false,
        events: { create: { type: "UNSET_PRIMARY", userId, payload: {} } },
      },
    });
    return ok(updated);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
