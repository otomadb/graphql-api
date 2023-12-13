import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { NotificationDTO } from "./Notification.dto.js";

export const mkGetNotificationResolver: MkQueryResolver<"getNotification", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.notification
      .findUniqueOrThrow({ where: { id: parseGqlID("Notification", id) } })
      .then((n) => NotificationDTO.fromPrisma(n))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Notification", id);
      });
