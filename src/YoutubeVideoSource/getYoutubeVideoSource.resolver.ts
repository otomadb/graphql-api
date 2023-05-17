import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

export const getYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.youtubeVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("YoutubeVideoSource", id) } })
      .then((v) => YoutubeVideoSourceDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("YoutubeVideoSource", id);
      })) satisfies QueryResolvers["getYoutubeVideoSource"];
