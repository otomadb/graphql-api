import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../id.js";
import { SemitagModel } from "../../Semitag/model.js";
import { ResolverDeps } from "../../types.js";

export const getSemitag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { id }, { user: ctxUser }, info) =>
    prisma.semitag
      .findUniqueOrThrow({ where: { id: parseGqlID("Semitag", id) } })
      .then((v) => SemitagModel.fromPrisma(v))
      .catch(() => {
        logger.error({ path: info.path, args: { id }, userId: ctxUser?.id }, "Not found");
        throw new GraphQLNotExistsInDBError("Semitag", id);
      })) satisfies QueryResolvers["getSemitag"];
