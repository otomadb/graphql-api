import { Semitag, SemitagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const reject = async (
  prisma: ResolverDeps["prisma"],
  { userId, semitagId }: { userId: string; semitagId: string },
): Promise<
  Result<
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown }
    | { type: "SEMITAG_NOT_FOUND" }
    | { type: "SEMITAG_ALREADY_CHECKED"; semitag: Semitag },
    { note: null; semitagId: string }
  >
> => {
  try {
    const check = await prisma.semitag.findUnique({ where: { id: semitagId } });
    if (!check) return err({ type: "SEMITAG_NOT_FOUND" });
    if (check.isChecked) return err({ type: "SEMITAG_ALREADY_CHECKED", semitag: check });

    await prisma.semitag.update({
      where: { id: check.id },
      data: {
        isChecked: true,
        events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
        checking: {
          create: {
            id: ulid(),
            videoTagId: null,
          },
        },
      },
    });
    return ok({ note: null, semitagId: check.id });
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
  }
};
