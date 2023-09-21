import { Resolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";

export type MkResolver<DI extends keyof ResolverDeps, D extends keyof Resolvers<unknown>> = (
  inject: Pick<ResolverDeps, DI>,
) => Resolvers[D];
