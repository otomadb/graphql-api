import { TagParentEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagParentModel } from "../TagParent/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveTagParentEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("TagParentEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
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

export const resolveTagParentCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentCreateEvent"]);

export const resolveTagParentSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentSetPrimaryEvent"]);

export const resolveTagParentUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagParentEventCommonProps(deps),
  } satisfies Resolvers["TagParentUnsetPrimaryEvent"]);
