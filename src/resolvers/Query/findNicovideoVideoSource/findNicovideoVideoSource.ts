import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";
import { ResolverDeps } from "../../types.js";

export const findNicovideoVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
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

    return new NicovideoVideoSourceModel(source);
  }) satisfies QueryResolvers["findNicovideoVideoSource"];
