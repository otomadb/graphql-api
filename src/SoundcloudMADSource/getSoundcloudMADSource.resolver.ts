import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudMADSourceDTO } from "./SoundcloudMADSource.dto.js";

export const getSoundcloudMADSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.soundcloudVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("SoundcloudMADSource", id) } })
      .then((v) => SoundcloudMADSourceDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("SoundcloudMADSource", id);
      })) satisfies QueryResolvers["getSoundcloudMADSource"];
