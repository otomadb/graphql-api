import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";

export const resolveVideoEventCommonProps = ({ prisma, userService }: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoEvent", id),
    user: async ({ userId }) => userService.getById(userId),
    video: ({ videoId }) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
  } satisfies Omit<Exclude<Resolvers["VideoEvent"], undefined>, "__resolveType">);

export const resolveVideoEvent = () =>
  ({
    __resolveType({ type }) {
      switch (type) {
        case "REGISTER":
          return "VideoRegisterEvent";
      }
    },
  } satisfies Resolvers["VideoEvent"]);

export const resolveVideoRegisterEvent = (deps: Pick<ResolverDeps, "prisma" | "userService">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoRegisterEvent"]);
