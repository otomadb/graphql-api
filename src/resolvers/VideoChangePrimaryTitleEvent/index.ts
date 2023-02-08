import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

export const resolveVideoChangePrimaryTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
  } satisfies Resolvers["VideoChangePrimaryTitleEvent"]);
