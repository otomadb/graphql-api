import { TagEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveTagEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("TagEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
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

export const resolveTagRegisterEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveTagEventCommonProps(deps),
  } satisfies Resolvers["TagRegisterEvent"]);
