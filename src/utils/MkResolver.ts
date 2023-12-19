import { Logger } from "pino";

import { MutationResolvers, QueryResolvers, Resolvers } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";

export type MkResolverWithInclude<
  D extends keyof Resolvers<unknown>,
  DI extends keyof ResolverDeps | undefined = undefined,
> = (inject: Pick<ResolverDeps, Exclude<DI, undefined>>) => Required<Exclude<Resolvers[D], undefined>>;

export type MkResolver<D extends keyof Resolvers<unknown>, DI extends keyof ResolverDeps | undefined = undefined> = (
  inject: Pick<ResolverDeps, Exclude<DI, undefined>>,
) => Omit<ReturnType<MkResolverWithInclude<D, DI>>, "__isTypeOf">;

export type MkQueryResolver<D extends keyof QueryResolvers, DI extends keyof ResolverDeps | undefined = undefined> = (
  inject: Pick<ResolverDeps, Exclude<DI, undefined>>,
) => Exclude<QueryResolvers[D], undefined>; // TODO: Excludeがなぜ必要なのかわからない

export type MkMutationResolver<
  D extends keyof MutationResolvers,
  DI extends keyof ResolverDeps | undefined = undefined,
> = (inject: Pick<ResolverDeps, Exclude<DI, undefined>>) => Exclude<MutationResolvers[D], undefined>; // TODO: Excludeがなぜ必要なのかわからない

export type MkMutationResolver2<
  D extends keyof MutationResolvers,
  DI extends Exclude<keyof ResolverDeps, "logger"> | undefined = undefined,
> = (logger: Logger, inject: Pick<ResolverDeps, Exclude<DI, undefined>>) => Exclude<MutationResolvers[D], undefined>; // TODO: Excludeがなぜ必要なのかわからない
