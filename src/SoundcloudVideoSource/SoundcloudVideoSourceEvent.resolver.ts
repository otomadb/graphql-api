import { SoundcloudVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../resolvers/graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudVideoSourceDTO } from "./dto.js";

export const resolveSoundcloudVideoSourceEventCommonProps = ({
  prisma,
  userService,
}: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("SoundcloudVideoSourceEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.youtubeVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => SoundcloudVideoSourceDTO.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("SoundcloudVideoSource", videoSourceId);
        }),
  }) satisfies Omit<Exclude<Resolvers["SoundcloudVideoSourceEvent"], undefined>, "__resolveType">;

export const resolveSoundcloudVideoSourceEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case SoundcloudVideoSourceEventType.CREATE:
          return "SoundcloudVideoSourceCreateEvent";
      }
    },
  }) satisfies Resolvers["SoundcloudVideoSourceEvent"];

export const resolveSoundcloudVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({ ...resolveSoundcloudVideoSourceEventCommonProps(deps) }) satisfies Resolvers["SoundcloudVideoSourceCreateEvent"];
