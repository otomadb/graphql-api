import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { ResolverDeps } from "../../types.js";
import { YoutubeRegistrationRequestModel } from "../../YoutubeRegistrationRequest/model.js";

export const resolverGetYoutubeRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, _ctx, info) =>
    prisma.youtubeRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("YoutubeRegistrationRequest", id) } })
      .then((v) => YoutubeRegistrationRequestModel.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id } }, "Not found");
        throw new GraphQLNotExistsInDBError("YoutubeRegistrationRequest", id);
      })) satisfies QueryResolvers["getYoutubeRegistrationRequest"];
