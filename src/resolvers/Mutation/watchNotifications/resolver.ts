import { GraphQLError } from "graphql";

import { NotificationDTO } from "../../../Notification/Notification.dto.js";
import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes } from "../../graphql.js";
import { parseGqlIDs3SkipDupl } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { update } from "./prisma.js";

export const resolverWatchNotifications = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { notificationIds: unparsedNotificationIds } }, { currentUser }, info) => {
    const notificationIds = parseGqlIDs3SkipDupl("Notification", unparsedNotificationIds);
    if (isErr(notificationIds)) {
      switch (notificationIds.error.type) {
        case "INVALID_ID":
          logger.error(
            {
              path: info.path,
              id: notificationIds.error.invalidId,
              input: unparsedNotificationIds,
              currentUserId: currentUser.id,
            },
            "given Notification ID is invalid",
          );
          throw new GraphQLError("Invalid ID");
      }
    }

    const result = await update(prisma, {
      authUserId: currentUser.id,
      notificationIds: notificationIds.data,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          throw new GraphQLError("Internal server error");
        case "WRONG_NOTIFYTO":
          logger.error(
            {
              path: info.path,
              notificationId: result.error.notificationId,
              actualNotifyToId: result.error.actualNotifyToId,
              currentUserId: currentUser.id,
            },
            "User try to watch notification whom notify to is different",
          );
          throw new GraphQLError("Authentication error");
      }
    }

    const { notifications } = result.data;

    return {
      __typename: "WatchNotificationsSucceededPayload",
      notifications: notifications.map((n) => NotificationDTO.fromPrisma(n)),
    } satisfies ResolversTypes["WatchNotificationsReturnUnion"];
  }) satisfies MutationResolvers["watchNotifications"];
