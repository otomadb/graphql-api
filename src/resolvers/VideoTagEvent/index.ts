import { VideoTagEventType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { UserModel } from "../User/model.js";
import { VideoTagModel } from "../VideoTag/model.js";

export const resolveVideoTagEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoTagEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
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
        case VideoTagEventType.ATTACHED:
          return "VideoTagAttachEvent";
        case VideoTagEventType.REATTACHED:
          return "VideoTagReattachEvent";
        case VideoTagEventType.REMOVED:
          return "VideoTagDetachEvent";
        default:
          throw new GraphQLError(`Unknown VideoTagEventType: ${type}`);
      }
    },
  } satisfies Resolvers["VideoTagEvent"]);

export const resolveVideoTagAttachEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagAttachEvent"]);

export const resolveVideoTagReattachEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagReattachEvent"]);

export const resolveVideoTagDetachEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoTagEventCommonProps(deps),
  } satisfies Resolvers["VideoTagDetachEvent"]);
