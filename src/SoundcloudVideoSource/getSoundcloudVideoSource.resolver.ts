import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudVideoSourceDTO } from "./dto.js";

export const getSoundcloudVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.soundcloudVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("SoundcloudVideoSource", id) } })
      .then((v) => SoundcloudVideoSourceDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("SoundcloudVideoSource", id);
      })) satisfies QueryResolvers["getSoundcloudVideoSource"];
