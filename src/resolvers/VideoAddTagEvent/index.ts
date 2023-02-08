import { Resolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { TagModel } from "../Tag/model.js";

export const resolveVideoAddTagEvent = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    tag: async ({ payload }) =>
      prisma.videoTag
        .findUniqueOrThrow({ where: { id: payload.id }, select: { tag: true } })
        .then(({ tag }) => new TagModel(tag)),
  } satisfies Resolvers["VideoAddTagEvent"]);
