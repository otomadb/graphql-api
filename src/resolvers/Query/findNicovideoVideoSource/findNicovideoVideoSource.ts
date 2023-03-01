import { GraphQLError } from "graphql";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";

export const findNicovideoVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { sourceId } }, { user: ctxUser }, info) => {
    if (!sourceId) {
      logger.error({ path: info.path, args: { input: { sourceId } }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("source id must be provided"); // TODO: error messsage
    }

    const source = await prisma.nicovideoVideoSource.findFirst({ where: { sourceId } });
    if (!source) {
      logger.warn({ path: info.path, args: { input: { sourceId } }, userId: ctxUser?.id }, "Not found");
      return null;
    }

    return new NicovideoVideoSourceModel(source);
  }) satisfies QueryResolvers["findNicovideoVideoSource"];
