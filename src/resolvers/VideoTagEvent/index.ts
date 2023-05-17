import { VideoTagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoTagModel } from "../VideoTag/model.js";

export const resolveVideoTagEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoTagEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    videoTag: ({ videoTagId }) =>
      prisma.videoTag
        .findUniqueOrThrow({ where: { id: videoTagId } })
        .then((v) => new VideoTagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("VideoThumbnail", videoTagId);
        }),
  } satisfies Omit<Exclude<Resolvers["VideoTagEvent"], undefined>, "__resolveType">);

export const resolveVideoTagEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case VideoTagEventType.ATTACH:
          return "VideoTagAttachEvent";
        case VideoTagEventType.REATTACH:
          return "VideoTagReattachEvent";
        case VideoTagEventType.DETACH:
          return "VideoTagDetachEvent";
        default:
          throw new GraphQLError(`Unknown VideoTagEventType: ${type}`);
      }
    },
  } satisfies Resolvers["VideoTagEvent"]);

export const resolveVideoTagAttachEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagAttachEvent"]);

export const resolveVideoTagReattachEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagReattachEvent"]);

export const resolveVideoTagDetachEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagDetachEvent"]);
