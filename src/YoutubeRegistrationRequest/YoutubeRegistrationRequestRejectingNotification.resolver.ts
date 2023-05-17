import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../resolvers/graphql.js";
import { resolverNotification } from "../resolvers/Notification/resolver.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeRegistrationRequestRejectingDTO } from "./dto.js";

export const resolverYoutubeRegistrationRequestRejectingNotification = ({
  prisma,
  logger,
  userService,
}: Pick<ResolverDeps, "logger" | "prisma" | "userService">) =>
  ({
    ...resolverNotification({ prisma, userService, logger }),
    rejecting: ({ dbId, payload }, _args, _ctx, info) => {
      const p = z.object({ id: z.string() }).safeParse(payload);
      if (!p.success) {
        logger.error(
          { error: p.error, path: info.path, notificationId: dbId, payload },
          "NotificationpPayload is not valid"
        );
        throw new GraphQLError("Something wrong happened");
      }
      return prisma.youtubeRegistrationRequestChecking
        .findUniqueOrThrow({ where: { id: p.data.id } })
        .then((c) => YoutubeRegistrationRequestRejectingDTO.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        });
    },
  } satisfies Resolvers["YoutubeRegistrationRequestRejectingNotification"]);
