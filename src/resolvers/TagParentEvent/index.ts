import { TagParentEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { TagParentModel } from "../TagParent/model.js";
import { UserModel } from "../User/model.js";

export const resolveTagParentEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagParentEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
    tagParent: ({ tagParentId }) =>
      prisma.tagParent
        .findUniqueOrThrow({ where: { id: tagParentId } })
        .then((v) => new TagParentModel(v))
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

export const resolveTagParentCreateEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagParentEventCommonProps({ prisma }),
  } satisfies Resolvers["TagParentCreateEvent"]);

export const resolveTagParentSetPrimaryEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagParentEventCommonProps({ prisma }),
  } satisfies Resolvers["TagParentSetPrimaryEvent"]);

export const resolveTagParentUnsetPrimaryEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagParentEventCommonProps({ prisma }),
  } satisfies Resolvers["TagParentUnsetPrimaryEvent"]);
