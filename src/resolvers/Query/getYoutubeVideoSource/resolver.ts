import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { YoutubeVideoSourceModel } from "../../YoutubeVideoSource/model.js";

export const getYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.youtubeVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("YoutubeVideoSource", id) } })
      .then((v) => YoutubeVideoSourceModel.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("YoutubeVideoSource", id);
      })) satisfies QueryResolvers["getYoutubeVideoSource"];
