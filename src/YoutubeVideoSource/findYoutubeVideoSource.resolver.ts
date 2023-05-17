import { GraphQLError } from "graphql";

import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { YoutubeVideoSourceDTO } from "./dto.js";

export const resolverFindYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { sourceId }, { currentUser: ctxUser }, info) => {
    if (!sourceId) {
      logger.error({ path: info.path, args: { sourceId }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("source id must be provided");
    }

    const source = await prisma.youtubeVideoSource.findFirst({ where: { sourceId } });
    if (!source) {
      logger.info({ path: info.path, args: { sourceId }, userId: ctxUser?.id }, "Not found");
      return null;
    }

    return YoutubeVideoSourceDTO.fromPrisma(source);
  }) satisfies QueryResolvers["findYoutubeVideoSource"];
