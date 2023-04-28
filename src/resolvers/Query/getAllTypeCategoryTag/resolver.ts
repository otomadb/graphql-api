import { QueryResolvers } from "../../graphql.js";
import { TypeCategoryTagModel } from "../../TypeCategoryTag/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverGetAllTypeCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async () =>
    prisma.categoryTagTyping
      .findMany({})
      .then((ts) =>
        ts.map((t) => TypeCategoryTagModel.fromPrisma(t))
      )) satisfies QueryResolvers["getAllTypeCategoryTag"];
