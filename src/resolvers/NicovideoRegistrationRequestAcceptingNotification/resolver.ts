import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { NicovideoRegistrationRequestAcceptingModel } from "../NicovideoRegistrationRequestAccepting/model.js";
import { resolverNotification } from "../Notification/resolver.js";
import { ResolverDeps } from "../types.js";

export const resolverNicovideoRegistrationRequestAcceptingNotification = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "prisma" | "userRepository" | "logger">) =>
  ({
    ...resolverNotification({ prisma, userRepository }),
    accepting: (_parent, _args, _ctx, info) =>
      prisma.nicovideoRegistrationRequestChecking
        .findUniqueOrThrow({ where: { id: "01GT3C664H3ZKF6P3QKM2ZS0KF" } })
        .then((c) => NicovideoRegistrationRequestAcceptingModel.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        }),
    // id: ({ id }) => buildGqlId("Notification", id),
  } satisfies Resolvers["NicovideoRegistrationRequestAcceptingNotification"]);
