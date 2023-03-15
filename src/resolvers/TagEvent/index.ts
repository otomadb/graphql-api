import { TagEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveTagEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
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

export const resolveTagRegisterEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveTagEventCommonProps({ prisma }),
  } satisfies Resolvers["TagRegisterEvent"]);
