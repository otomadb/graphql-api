import { VideoTitleEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { UserModel } from "../User/model.js";
import { VideoTitleModel } from "../VideoTitle/model.js";

export const resolveVideoEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoTitleEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
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
        case VideoTitleEventType.CREATED:
          return "VideoTitleCreateEventType";
        case VideoTitleEventType.SET_PRIMARY:
          return "VideoTitleSetPrimaryEventType";
        case VideoTitleEventType.UNSET_PRIMARY:
          return "VideoTitleUnsetPrimaryEventType";
      }
    },
  } satisfies Resolvers["VideoTitleEvent"]);

export const resolveVideoTitleCreateEventType = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleCreateEventType"]);

export const resolveVideoTitleSetPrimaryEventType = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleSetPrimaryEventType"]);

export const resolveVideoTitleUnsetPrimaryEventType = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoTitleUnsetPrimaryEventType"]);
