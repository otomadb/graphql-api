import { QueryResolvers } from "../../graphql.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverGetAllCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async () =>
    prisma.tag
      .findMany({ where: { isCategoryTag: true } })
      .then((ts) => ts.map((t) => TagModel.fromPrisma(t)))) satisfies QueryResolvers["getAllCategoryTag"];
