import { GraphQLError } from "graphql";

import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { NicovideoVideoSourceDTO } from "./dto.js";

export const findNicovideoVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { sourceId } }, { currentUser: ctxUser }, info) => {
    if (!sourceId) {
      logger.error({ path: info.path, args: { input: { sourceId } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("source id must be provided"); // TODO: error messsage
    }

    const source = await prisma.nicovideoVideoSource.findFirst({ where: { sourceId } });
    if (!source) {
      logger.info({ path: info.path, sourceId, userId: ctxUser?.id }, "Not found");
      return null;
    }

    return new NicovideoVideoSourceDTO(source);
  }) satisfies QueryResolvers["findNicovideoVideoSource"];
