import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TypeCategoryTagDTO } from "./dto.js";

export const resolverGetAllTypeCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async () =>
    prisma.categoryTagTyping
      .findMany({})
      .then((ts) => ts.map((t) => TypeCategoryTagDTO.fromPrisma(t)))) satisfies QueryResolvers["getAllTypeCategoryTag"];
