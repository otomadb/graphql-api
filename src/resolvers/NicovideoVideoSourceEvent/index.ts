import { NicovideoVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { NicovideoVideoSourceModel } from "../NicovideoVideoSource/model.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";

export const resolveNicovideoVideoSourceEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("NicovideoVideoSourceEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
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
        case NicovideoVideoSourceEventType.CREATE:
          return "NicovideoVideoSourceCreateEvent";
      }
    },
  } satisfies Resolvers["NicovideoVideoSourceEvent"]);

export const resolveNicovideoVideoSourceCreateEvent = (
  deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">
) =>
  ({
    ...resolveNicovideoVideoSourceEventCommonProps(deps),
  } satisfies Resolvers["NicovideoVideoSourceCreateEvent"]);
