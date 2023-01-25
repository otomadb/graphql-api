import { QueryResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const semitag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.semitag
      .findUniqueOrThrow({ where: { id: parseGqlID("Semitag", id) } })
      .then((v) => new SemitagModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("Semitag", id);
      })) satisfies QueryResolvers["semitag"];
