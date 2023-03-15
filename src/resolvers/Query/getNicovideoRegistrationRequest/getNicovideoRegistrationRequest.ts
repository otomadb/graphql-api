import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../../types.js";

export const getNicovideoRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { user: ctxUser }, info) =>
    prisma.nicovideoRegistrationRequest
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoRegistrationRequest", id) } })
      .then((v) => new NicovideoRegistrationRequestModel(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("NicovideoRegistrationRequest", id);
      })) satisfies QueryResolvers["getNicovideoRegistrationRequest"];
