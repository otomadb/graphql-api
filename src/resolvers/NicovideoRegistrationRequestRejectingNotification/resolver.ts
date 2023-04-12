import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../graphql.js";
import { NicovideoRegistrationRequestRejectingModel } from "../NicovideoRegistrationRequestRejecting/model.js";
import { resolverNotification } from "../Notification/resolver.js";
import { ResolverDeps } from "../types.js";

export const resolverNicovideoRegistrationRequestRejectingNotification = ({
  prisma,
  logger,
  userRepository,
}: Pick<ResolverDeps, "logger" | "prisma" | "userRepository">) =>
  ({
    ...resolverNotification({ prisma, userRepository }),
    rejecting: ({ dbId, payload }, _args, _ctx, info) => {
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
        .then((c) => NicovideoRegistrationRequestRejectingModel.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        });
    },
  } satisfies Resolvers["NicovideoRegistrationRequestRejectingNotification"]);
