import { Notification } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const update = async (
  prisma: ResolverDeps["prisma"],
  {
    authUserId,
    notificationIds,
  }: {
    authUserId: string;
    notificationIds: string[];
  }
): Promise<
  Result<
    | { type: "WRONG_NOTIFYTO"; notificationId: string; actualNotifyToId: string }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    { notifications: Notification[] }
  >
> => {
  try {
    const whole = await prisma.notification.findMany({
      where: { id: { in: notificationIds } },
      select: { id: true, notifyToId: true },
    });
    const wrongNotifyTo = whole.find((x) => x.notifyToId !== authUserId);
    if (wrongNotifyTo)
      return err({
        type: "WRONG_NOTIFYTO",
        notificationId: wrongNotifyTo.id,
        actualNotifyToId: wrongNotifyTo.notifyToId,
      });

    const ids = whole.map(({ id }) => id);
    const [, updated] = await prisma.$transaction([
      prisma.notification.updateMany({
        where: { id: { in: ids } },
        data: { isWatched: true },
      }),
      prisma.notification.findMany({
        where: { id: { in: ids } },
      }),
    ]);

    return ok({ notifications: updated });
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
  }
};
