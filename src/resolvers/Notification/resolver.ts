import { Resolvers } from "../graphql.js";
import { buildGqlId } from "../id.js";
import { ResolverDeps } from "../types.js";

export const resolverNotification = ({ prisma, userRepository }: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case "ACCEPTING_NICOVIDEO_REGISTRATION_REQUEST":
          return "NicovideoRegistrationRequestAcceptingNotification";
        case "REJECTING_NICOVIDEO_REGISTRATION_REQUEST":
          return "NicovideoRegistrationRequestRejectingNotification";
      }
    },
    id: ({ dbId }) => buildGqlId("Notification", dbId),
    notifyTo: ({ notifyToId: forId }) => userRepository.getById(forId),
    createdAt: ({ createdAt }) => createdAt,
    watched: ({ isWatched }) => isWatched,
  } satisfies Resolvers["Notification"]);
