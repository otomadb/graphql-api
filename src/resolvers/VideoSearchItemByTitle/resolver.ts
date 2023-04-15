import { Resolvers } from "../graphql.js";
import { GraphQLNotExistsInDBError } from "../id.js";
import { ResolverDeps } from "../types.js";
import { VideoModel } from "../Video/model.js";
import { VideoTitleModel } from "../VideoTitle/model.js";

export const resolverVideoSearchItemByTitle = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  ({
    video: ({ videoId }, _args, { currentUser: ctxUser }, info) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch((e) => {
          logger.error({ path: info.path, id: videoId, userId: ctxUser?.id, error: e }, "Not found");
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    title: ({ titleId }, _args, { currentUser: ctxUser }, info) =>
      prisma.videoTitle
        .findUniqueOrThrow({ where: { id: titleId } })
        .then((v) => new VideoTitleModel(v))
        .catch((e) => {
          logger.error({ path: info.path, userId: ctxUser?.id, error: e }, "Not found");
          throw new GraphQLNotExistsInDBError("VideoTitle", titleId);
        }),
  } satisfies Resolvers["VideoSearchItemByTitle"]);
