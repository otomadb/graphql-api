import { TagEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

export const resolveTagEventCommonProps = ({ prisma, userService }: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    tag: ({ tagId }) =>
      prisma.tag
        .findUniqueOrThrow({ where: { id: tagId } })
        .then((v) => new TagDTO(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
  }) satisfies Omit<Exclude<Resolvers["TagEvent"], undefined>, "__resolveType">;

export const resolveTagEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case TagEventType.REGISTER:
          return "TagRegisterEvent";
      }
    },
  }) satisfies Resolvers["TagEvent"];

export const resolveTagRegisterEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveTagEventCommonProps(deps),
  }) satisfies Resolvers["TagRegisterEvent"];
