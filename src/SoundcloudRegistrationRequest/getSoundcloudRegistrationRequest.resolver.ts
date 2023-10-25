import { QueryResolvers } from "../resolvers/graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { SoundcloudRegistrationRequestDTO } from "./SoundcloudRegistrationRequest.dto.js";

export const resolverGetSoundcloudRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, _ctx, info) =>
    prisma.soundcloudRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("SoundcloudRegistrationRequest", id) } })
      .then((v) => SoundcloudRegistrationRequestDTO.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id } }, "Not found");
        throw new GraphQLNotExistsInDBError("SoundcloudRegistrationRequest", id);
      })) satisfies QueryResolvers["getSoundcloudRegistrationRequest"];
