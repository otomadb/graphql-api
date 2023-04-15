import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../graphql.js";
import { NicovideoRegistrationRequestAcceptingModel } from "../NicovideoRegistrationRequestAccepting/model.js";
import { resolverNotification } from "../Notification/resolver.js";
import { ResolverDeps } from "../types.js";

export const resolverNicovideoRegistrationRequestAcceptingNotification = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "logger" | "prisma" | "userRepository">) =>
  ({
    ...resolverNotification({ prisma, userRepository }),
    accepting: ({ dbId, payload }, _args, _ctx, info) => {
      const p = z.object({ id: z.string() }).safeParse(payload);
      if (!p.success) {
        logger.error(
          { error: p.error, path: info.path, notificationId: dbId, payload },
          "NotificationpPayload is not valid"
        );
        throw new GraphQLError("Something wrong happened");
      }
      return prisma.nicovideoRegistrationRequestChecking
        .findUniqueOrThrow({ where: { id: p.data.id } })
        .then((c) => NicovideoRegistrationRequestAcceptingModel.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        });
    },
  } satisfies Resolvers["NicovideoRegistrationRequestAcceptingNotification"]);
