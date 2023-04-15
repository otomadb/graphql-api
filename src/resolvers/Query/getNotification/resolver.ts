import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { NotificationModel } from "../../Notification/model.js";
import { ResolverDeps } from "../../types.js";

export const getNotification = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.notification
      .findUniqueOrThrow({ where: { id: parseGqlID("Notification", id) } })
      .then((n) => NotificationModel.fromPrisma(n))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Notification", id);
      })) satisfies QueryResolvers["getNotification"];
