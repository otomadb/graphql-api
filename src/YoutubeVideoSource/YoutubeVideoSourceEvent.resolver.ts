import { YoutubeVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

export const resolveYoutubeVideoSourceEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("YoutubeVideoSourceEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.youtubeVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => YoutubeVideoSourceDTO.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeVideoSource", videoSourceId);
        }),
  }) satisfies Omit<Exclude<Resolvers["YoutubeVideoSourceEvent"], undefined>, "__resolveType">;

export const resolveYoutubeVideoSourceEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case YoutubeVideoSourceEventType.CREATE:
          return "YoutubeVideoSourceCreateEvent";
      }
    },
  }) satisfies Resolvers["YoutubeVideoSourceEvent"];

export const resolveYoutubeVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({ ...resolveYoutubeVideoSourceEventCommonProps(deps) }) satisfies Resolvers["YoutubeVideoSourceCreateEvent"];
