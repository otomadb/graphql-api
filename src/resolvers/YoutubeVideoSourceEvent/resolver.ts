import { YoutubeVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { YoutubeVideoSourceModel } from "../YoutubeVideoSource/model.js";

export const resolveYoutubeVideoSourceEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("YoutubeVideoSourceEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.youtubeVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => YoutubeVideoSourceModel.fromPrisma(v))
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

export const resolveYoutubeVideoSourceCreateEvent = (
  deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">
) => ({ ...resolveYoutubeVideoSourceEventCommonProps(deps) } satisfies Resolvers["YoutubeVideoSourceCreateEvent"]);
