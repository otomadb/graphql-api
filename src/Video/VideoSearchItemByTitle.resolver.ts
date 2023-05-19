import { Resolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO, VideoTitleDTO } from "./dto.js";

export const resolverVideoSearchItemByTitle = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  ({
    video: ({ videoId }, _args, { currentUser: ctxUser }, info) =>
      prisma.video
        .findUniqueOrThrow({ where: { id: videoId } })
        .then((v) => new VideoDTO(v))
        .catch((e) => {
          logger.error({ path: info.path, id: videoId, userId: ctxUser?.id, error: e }, "Not found");
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    title: ({ titleId }, _args, { currentUser: ctxUser }, info) =>
      prisma.videoTitle
        .findUniqueOrThrow({ where: { id: titleId } })
        .then((v) => new VideoTitleDTO(v))
        .catch((e) => {
          logger.error({ path: info.path, userId: ctxUser?.id, error: e }, "Not found");
          throw new GraphQLNotExistsInDBError("VideoTitle", titleId);
        }),
  } satisfies Resolvers["VideoSearchItemByTitle"]);
