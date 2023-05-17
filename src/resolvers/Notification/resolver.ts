import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../types.js";

export const resolverNotification = ({
  logger,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService" | "logger">) =>
  ({
    __resolveType({ type }, _context, info) {
      switch (type) {
        case "ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST":
          return "NicovideoRegistrationRequestAcceptingNotification";
        case "REJECTING_NICOVIDEO_REGISTRATION_REQUEST":
          return "NicovideoRegistrationRequestRejectingNotification";
        default:
          logger.error({ type, path: info.path }, "Unsupported notification type");
          throw new GraphQLError("Unsupported");
      }
    },
    id: ({ dbId }) => buildGqlId("Notification", dbId),
    notifyTo: ({ notifyToId: forId }) => userService.getById(forId),
    createdAt: ({ createdAt }) => createdAt,
    watched: ({ isWatched }) => isWatched,
  } satisfies Resolvers["Notification"]);
