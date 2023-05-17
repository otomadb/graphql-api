import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { SoundcloudVideoSourceModel } from "../../SoundcloudVideoSource/model.js";
import { ResolverDeps } from "../../types.js";

export const getSoundcloudVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.soundcloudVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("SoundcloudVideoSource", id) } })
      .then((v) => SoundcloudVideoSourceModel.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("SoundcloudVideoSource", id);
      })) satisfies QueryResolvers["getSoundcloudVideoSource"];
