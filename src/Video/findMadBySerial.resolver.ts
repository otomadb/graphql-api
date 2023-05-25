import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { VideoDTO } from "./dto.js";

export const resolverFindMadBySerial = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { serial }, _ctx, info) => {
    const v = await prisma.video.findFirst({ where: { serial } });
    if (!v) {
      logger.info({ path: info.path, serial }, "Not found");
      return null;
    }
    return new VideoDTO(v);
  }) satisfies QueryResolvers["findMadBySerial"];
