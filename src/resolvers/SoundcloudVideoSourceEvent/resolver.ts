import { SoundcloudVideoSourceEventType } from "@prisma/client";

import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { SoundcloudVideoSourceModel } from "../SoundcloudVideoSource/model.js";
import { ResolverDeps } from "../types.js";

export const resolveSoundcloudVideoSourceEventCommonProps = ({
  prisma,
  userRepository,
}: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({
    id: ({ id }): string => buildGqlId("SoundcloudVideoSourceEvent", id),
    user: async ({ userId }) => userRepository.getById(userId),
    source: ({ sourceId: videoSourceId }) =>
      prisma.youtubeVideoSource
        .findUniqueOrThrow({ where: { id: videoSourceId } })
        .then((v) => SoundcloudVideoSourceModel.fromPrisma(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("SoundcloudVideoSource", videoSourceId);
        }),
  } satisfies Omit<Exclude<Resolvers["SoundcloudVideoSourceEvent"], undefined>, "__resolveType">);

export const resolveSoundcloudVideoSourceEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case SoundcloudVideoSourceEventType.CREATE:
          return "SoundcloudVideoSourceCreateEvent";
      }
    },
  } satisfies Resolvers["SoundcloudVideoSourceEvent"]);

export const resolveSoundcloudVideoSourceCreateEvent = (deps: Pick<ResolverDeps, "prisma" | "userRepository">) =>
  ({ ...resolveSoundcloudVideoSourceEventCommonProps(deps) } satisfies Resolvers["SoundcloudVideoSourceCreateEvent"]);
