import { TagNameEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagNameModel } from "../TagName/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveTagNameEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
    tagName: ({ tagNameId }) =>
      prisma.tagName
        .findUniqueOrThrow({ where: { id: tagNameId } })
        .then((v) => new TagNameModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("TagName", tagNameId);
        }),
  } satisfies Omit<Exclude<Resolvers["TagNameEvent"], undefined>, "__resolveType">);

export const resolveTagNameEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case TagNameEventType.CREATE:
          return "TagNameCreateEvent";
        case TagNameEventType.SET_PRIMARY:
          return "TagNameSetPrimaryEvent";
        case TagNameEventType.UNSET_PRIMARY:
          return "TagNameUnsetPrimaryEvent";
      }
    },
  } satisfies Resolvers["TagNameEvent"]);

export const resolveTagNameCreateEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagNameEventCommonProps({ prisma }),
  } satisfies Resolvers["TagNameCreateEvent"]);

export const resolveTagNameSetPrimaryEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagNameEventCommonProps({ prisma }),
  } satisfies Resolvers["TagNameSetPrimaryEvent"]);

export const resolveTagNameUnsetPrimaryEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagNameEventCommonProps({ prisma }),
  } satisfies Resolvers["TagNameUnsetPrimaryEvent"]);
