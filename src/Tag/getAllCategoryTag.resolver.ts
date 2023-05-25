import { QueryResolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

export const resolverGetAllCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async () =>
    prisma.tag
      .findMany({ where: { isCategoryTag: true } })
      .then((ts) => ts.map((t) => TagDTO.fromPrisma(t)))) satisfies QueryResolvers["getAllCategoryTag"];
