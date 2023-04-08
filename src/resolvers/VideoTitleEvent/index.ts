import { VideoTitleEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { VideoTitleModel } from "../VideoTitle/model.js";

export const resolveVideoEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoTitleEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
    videoTitle: ({ videoTitleId }) =>
      prisma.videoTitle
        .findUniqueOrThrow({ where: { id: videoTitleId } })
        .then((v) => new VideoTitleModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("VideoTitle", videoTitleId);
        }),
  } satisfies Omit<Exclude<Resolvers["VideoTitleEvent"], undefined>, "__resolveType">);

export const resolveVideoTitleEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case VideoTitleEventType.CREATE:
          return "VideoTitleCreateEvent";
        case VideoTitleEventType.SET_PRIMARY:
          return "VideoTitleSetPrimaryEvent";
        case VideoTitleEventType.UNSET_PRIMARY:
          return "VideoTitleUnsetPrimaryEvent";
      }
    },
  } satisfies Resolvers["VideoTitleEvent"]);

export const resolveVideoTitleCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleCreateEvent"]);

export const resolveVideoTitleSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleSetPrimaryEvent"]);

export const resolveVideoTitleUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleUnsetPrimaryEvent"]);
