import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { YoutubeVideoSourceModel } from "../../YoutubeVideoSource/model.js";

export const resolverFindYoutubeVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
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

    return YoutubeVideoSourceModel.fromPrisma(source);
  }) satisfies QueryResolvers["findYoutubeVideoSource"];
