import { TagNameEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagNameModel } from "../TagName/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveTagNameEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
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

export const resolveTagNameCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  } satisfies Resolvers["TagNameCreateEvent"]);

export const resolveTagNameSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  } satisfies Resolvers["TagNameSetPrimaryEvent"]);

export const resolveTagNameUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  } satisfies Resolvers["TagNameUnsetPrimaryEvent"]);
