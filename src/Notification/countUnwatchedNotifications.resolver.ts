import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkCountUnwatchedNotificationsResolver: MkQueryResolver<"countUnwatchedNotifications", "prisma"> =
  ({ prisma }) =>
  async (_parent, _args, { currentUser: ctxUser }) => {
    if (!ctxUser) return null;
    return prisma.notification.count({
      where: { notifyToId: ctxUser.id, isWatched: false },
    });
  };
