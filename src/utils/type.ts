import { Resolver, ResolverFn } from "../graphql/resolvers.js";

export type ResolverArgs<R> = R extends Resolver<infer TResult, infer TParent, infer TContext, infer TArgs>
  ? Parameters<ResolverFn<TResult, TParent, TContext, TArgs>>
  : never;
