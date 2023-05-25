import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

export const resolverFindTagBySerial = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { serial }, _ctx, info) => {
    const t = await prisma.tag.findFirst({ where: { serial } });
    if (!t) {
      logger.info({ path: info.path, serial }, "Not found");
      return null;
    }
    return new TagDTO(t);
  }) satisfies QueryResolvers["findTagBySerial"];
