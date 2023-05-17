import { VideoTitleEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoThumbnailModel } from "../VideoThumbnail/model.js";

export const resolveVideoThumbnailEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoThumbnailEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    videoThumbnail: ({ videoThumbnailId }) =>
      prisma.videoThumbnail
        .findUniqueOrThrow({ where: { id: videoThumbnailId } })
        .then((v) => new VideoThumbnailModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("VideoThumbnail", videoThumbnailId);
        }),
  } satisfies Omit<Exclude<Resolvers["VideoThumbnailEvent"], undefined>, "__resolveType">);

export const resolveVideoThumbnailEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case VideoTitleEventType.CREATE:
          return "VideoThumbnailCreateEvent";
        case VideoTitleEventType.SET_PRIMARY:
          return "VideoThumbnailSetPrimaryEvent";
        case VideoTitleEventType.UNSET_PRIMARY:
          return "VideoThumbnailUnsetPrimaryEvent";
      }
    },
  } satisfies Resolvers["VideoThumbnailEvent"]);

export const resolveVideoThumbnailCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoThumbnailEventCommonProps(deps),
  } satisfies Resolvers["VideoThumbnailCreateEvent"]);

export const resolveVideoThumbnailSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoThumbnailEventCommonProps(deps),
  } satisfies Resolvers["VideoThumbnailSetPrimaryEvent"]);

export const resolveVideoThumbnailUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoThumbnailEventCommonProps(deps),
  } satisfies Resolvers["VideoThumbnailUnsetPrimaryEvent"]);
