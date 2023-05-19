import { NicovideoVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoVideoSourceDTO } from "./dto.js";

export const resolveNicovideoVideoSourceEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("NicovideoVideoSourceEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.nicovideoVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => new NicovideoVideoSourceDTO(v))
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

export const resolveNicovideoVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveNicovideoVideoSourceEventCommonProps(deps),
  } satisfies Resolvers["NicovideoVideoSourceCreateEvent"]);
