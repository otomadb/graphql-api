import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const tag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { id }) =>
    prisma.tag
      .findUniqueOrThrow({ where: { id: parseGqlID("Tag", id) } })
      .then((v) => new TagModel(v))
      .catch(() => {
        throw new GraphQLNotExistsInDBError("Tag", id);
      })) satisfies QueryResolvers["tag"];
