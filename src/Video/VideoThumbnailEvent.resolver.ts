import { VideoTitleEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoThumbnailDTO } from "./dto.js";

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
        .then((v) => new VideoThumbnailDTO(v))
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
