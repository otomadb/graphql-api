import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { NicovideoVideoSourceModel } from "../../NicovideoVideoSource/model.js";
import { ResolverDeps } from "../../types.js";

export const getNicovideoVideoSource = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { id }, { currentUser: ctxUser }, info) =>
    prisma.nicovideoVideoSource
      .findUniqueOrThrow({ where: { id: parseGqlID("NicovideoVideoSource", id) } })
      .then((v) => new NicovideoVideoSourceModel(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("NicovideoVideoSource", id);
      })) satisfies QueryResolvers["getNicovideoVideoSource"];
