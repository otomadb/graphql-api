import { GraphQLError } from "graphql";
import z from "zod";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId } from "../resolvers/id.js";
import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "../Tag/dto.js";
import { isErr } from "../utils/Result.js";

export const resolverYoutubeRegistrationRequest = ({
  prisma,
  userService,
  logger,
  YoutubeRegistrationRequestEventService,
}: Pick<ResolverDeps, "prisma" | "userService" | "logger" | "YoutubeRegistrationRequestEventService">) =>
  ({
    id: ({ dbId: requestId }) => buildGqlId("YoutubeRegistrationRequest", requestId),

    originalUrl: ({ sourceId }) => `https://www.youtube.com/watch?v=${sourceId}`,
    embedUrl: ({ sourceId }) => `https://www.youtube.com/embed/${sourceId}`,

    taggings: ({ dbId: requestId }) => {
      return prisma.youtubeRegistrationRequestTagging
        .findMany({ where: { requestId }, include: { tag: true } })
        .then((r) =>
          r.map(({ id, tag, note }) => ({
            id: buildGqlId("YoutubeRegistrationRequestTagging", id),
            tag: new TagDTO(tag),
            note,
          })),
        );
    },
    semitaggings: ({ dbId: requestId }) => {
      return prisma.youtubeRegistrationRequestSemitagging.findMany({ where: { requestId } }).then((r) =>
        r.map(({ id, name, note }) => ({
          id: buildGqlId("YoutubeRegistrationRequestSemitagging", id),
          name,
          note,
        })),
      );
    },
    requestedBy: async ({ requestedById }) => userService.getById(requestedById),
    events: ({ dbId }, { input: { orderBy: unparsedOrderBy, ...unparsedConnectionArgs } }, _ctx, info) => {
      const connectionArgs = z
        .union([
          z.object({}), // 全ての取得を許容する
          z.object({ first: z.number(), after: z.string().optional() }),
          z.object({ last: z.number(), before: z.string().optional() }),
        ])
        .safeParse(unparsedConnectionArgs);
      if (!connectionArgs.success) {
        logger.error({ path: info.path, args: unparsedConnectionArgs }, "Wrong args");
        throw new GraphQLError("Wrong args");
      }

      const orderBy = parseOrderBy(unparsedOrderBy);
      if (isErr(orderBy)) {
        logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
        throw new GraphQLError("Wrong args");
      }

      return YoutubeRegistrationRequestEventService.findConnection(dbId, connectionArgs.data, orderBy.data);
    },
  }) satisfies Resolvers["YoutubeRegistrationRequest"];
