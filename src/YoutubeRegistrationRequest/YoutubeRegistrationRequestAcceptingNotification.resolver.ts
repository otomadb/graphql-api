import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../resolvers/graphql.js";
import { resolverNotification } from "../resolvers/Notification/resolver.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeRegistrationRequestAcceptingDTO } from "./dto.js";

export const resolverYoutubeRegistrationRequestAcceptingNotification = ({
  prisma,
  userRepository,
  logger,
}: Pick<ResolverDeps, "prisma" | "userRepository" | "logger">) =>
  ({
    ...resolverNotification({ prisma, userRepository, logger }),
    accepting: ({ dbId, payload }, _args, _ctx, info) => {
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
        .then((c) => YoutubeRegistrationRequestAcceptingDTO.fromPrisma(c))
        .catch((e) => {
          logger.error({ error: e, path: info.path, id: p.data.id }, "Accepting not found");
          throw new GraphQLError("Something wrong happened");
        });
    },
  } satisfies Resolvers["YoutubeRegistrationRequestAcceptingNotification"]);