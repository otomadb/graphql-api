import { Resolvers } from "../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { UserModel } from "../User/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveVideoEventCommonProps = ({
  prisma,
  auth0Management,
  logger,
}: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    id: ({ id }): string => buildGqlId("VideoEvent", id),
    user: async ({ userId }) => UserModel.fromAuth0({ auth0Management, logger }, userId),
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

export const resolveVideoRegisterEvent = (deps: Pick<ResolverDeps, "prisma" | "auth0Management" | "logger">) =>
  ({
    ...resolveVideoEventCommonProps(deps),
  } satisfies Resolvers["VideoRegisterEvent"]);
