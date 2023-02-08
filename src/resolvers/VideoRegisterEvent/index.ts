import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { resolveVideoEventCommonProps } from "../VideoEvent/index.js";

export const resolveVideoRegisterEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    ...resolveVideoEventCommonProps({ prisma }),
  } satisfies Resolvers["VideoRegisterEvent"]);
