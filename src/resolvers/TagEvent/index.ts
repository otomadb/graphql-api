import { TagEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";

export const resolveTagEventCommonProps = ({ prisma, userService }: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    tag: ({ tagId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
  } satisfies Omit<Exclude<Resolvers["TagEvent"], undefined>, "__resolveType">);

export const resolveTagEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case TagEventType.REGISTER:
          return "TagRegisterEvent";
      }
    },
  } satisfies Resolvers["TagEvent"]);

export const resolveTagRegisterEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagEventCommonProps(deps),
  } satisfies Resolvers["TagRegisterEvent"]);
