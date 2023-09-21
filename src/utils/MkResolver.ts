import { Resolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";

export type MkResolverWithInclude<
  D extends keyof Resolvers<unknown>,
  DI extends keyof ResolverDeps | undefined = undefined,
> = (inject: Pick<ResolverDeps, Exclude<DI, undefined>>) => Required<Exclude<Resolvers[D], undefined>>;

export type MkResolver<D extends keyof Resolvers<unknown>, DI extends keyof ResolverDeps | undefined = undefined> = (
  inject: Pick<ResolverDeps, Exclude<DI, undefined>>,
) => Omit<ReturnType<MkResolverWithInclude<D, DI>>, "__isTypeOf">;
