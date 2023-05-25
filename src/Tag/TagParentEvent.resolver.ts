import { TagParentEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagParentDTO } from "./dto.js";

export const resolveTagParentEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("TagParentEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    tagParent: ({ tagParentId }) =>
      prisma.tagParent
        .findUniqueOrThrow({ where: { id: tagParentId } })
        .then((v) => new TagParentDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("TagParent", tagParentId);
        }),
  } satisfies Omit<Exclude<Resolvers["TagParentEvent"], undefined>, "__resolveType">);

export const resolveTagParentEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case TagParentEventType.CREATE:
          return "TagParentCreateEvent";
        case TagParentEventType.SET_PRIMARY:
          return "TagParentSetPrimaryEvent";
        case TagParentEventType.UNSET_PRIMARY:
          return "TagParentUnsetPrimaryEvent";
      }
    },
  } satisfies Resolvers["TagParentEvent"]);

export const resolveTagParentCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentCreateEvent"]);

export const resolveTagParentSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentSetPrimaryEvent"]);

export const resolveTagParentUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentUnsetPrimaryEvent"]);
