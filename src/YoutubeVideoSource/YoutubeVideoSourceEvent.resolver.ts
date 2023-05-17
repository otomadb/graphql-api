import { YoutubeVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

export const resolveYoutubeVideoSourceEventCommonProps = ({
  prisma,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({
    id: ({ id }): string => buildGqlId("YoutubeVideoSourceEvent", id),
    user: async ({ userId }) => userRepository.getById(userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.youtubeVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => YoutubeVideoSourceDTO.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("YoutubeVideoSource", videoSourceId);
        }),
  } satisfies Omit<Exclude<Resolvers["YoutubeVideoSourceEvent"], undefined>, "__resolveType">);

export const resolveYoutubeVideoSourceEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case YoutubeVideoSourceEventType.CREATE:
          return "YoutubeVideoSourceCreateEvent";
      }
    },
  } satisfies Resolvers["YoutubeVideoSourceEvent"]);

export const resolveYoutubeVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({ ...resolveYoutubeVideoSourceEventCommonProps(deps) } satisfies Resolvers["YoutubeVideoSourceCreateEvent"]);
