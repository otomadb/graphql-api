import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";

export const resolveVideoAddTitleEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    title: ({ payload }) => prisma.videoTitle.findUniqueOrThrow({ where: { id: payload.id } }).then((v) => v.title),
  } satisfies Resolvers["VideoAddTitleEvent"]);
