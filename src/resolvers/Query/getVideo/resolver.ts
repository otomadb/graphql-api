import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";

export const getVideo = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { user: ctxUser }, info) =>
    prisma.video
      .findUniqueOrThrow({ where: { id: parseGqlID("Video", id) } })
      .then((v) => new VideoModel(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Video", id);
      })) satisfies QueryResolvers["video"];
