import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../resolvers/graphql.js";
import { resolverNotification } from "../resolvers/Notification/resolver.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoRegistrationRequestAcceptingDTO } from "./dto.js";

export const resolverNicovideoRegistrationRequestAcceptingNotification = ({
  prisma,
  userService,
  logger,
}: Pick<ResolverDeps, "prisma" | "userService" | "logger">) =>
  ({
    ...resolverNotification({ prisma, userService, logger }),
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
        .then((c) => NicovideoRegistrationRequestAcceptingDTO.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        });
    },
  } satisfies Resolvers["NicovideoRegistrationRequestAcceptingNotification"]);
