import { NicovideoVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../index.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { UserModel } from "../User/model.js";

export const resolveNicovideoVideoSourceEventCommonProps = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    id: ({ id }): string => buildGqlId("NicovideoVideoSourceEvent", id),
    user: ({ userId }) =>
      prisma.user
        .findUniqueOrThrow({ where: { id: userId } })
        .then((u) => new UserModel(u))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("User", userId);
        }),
    source: ({ sourceId: videoSourceId }) =>
      prisma.nicovideoVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => new NicovideoVideoSourceModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("NicovideoVideoSource", videoSourceId);
        }),
  } satisfies Omit<Exclude<Resolvers["NicovideoVideoSourceEvent"], undefined>, "__resolveType">);

export const resolveNicovideoVideoSourceEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case NicovideoVideoSourceEventType.CREATED:
          return "NicovideoVideoSourceCreateEvent";
      }
    },
  } satisfies Resolvers["NicovideoVideoSourceEvent"]);

export const resolveNicovideoVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveNicovideoVideoSourceEventCommonProps(deps),
  } satisfies Resolvers["NicovideoVideoSourceCreateEvent"]);
