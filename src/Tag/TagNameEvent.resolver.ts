import { TagNameEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagNameDTO } from "./dto.js";

export const resolveTagNameEventCommonProps = ({ prisma, userService }: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    tagName: ({ tagNameId }) =>
      prisma.tagName
        .findUniqueOrThrow({ where: { id: tagNameId } })
        .then((v) => new TagNameDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("TagName", tagNameId);
        }),
  }) satisfies Omit<Exclude<Resolvers["TagNameEvent"], undefined>, "__resolveType">;

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
  }) satisfies Resolvers["TagNameEvent"];

export const resolveTagNameCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  }) satisfies Resolvers["TagNameCreateEvent"];

export const resolveTagNameSetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  }) satisfies Resolvers["TagNameSetPrimaryEvent"];

export const resolveTagNameUnsetPrimaryEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagNameEventCommonProps(deps),
  }) satisfies Resolvers["TagNameUnsetPrimaryEvent"];
