import { VideoResolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { parseSortOrder } from "../parseSortOrder.js";
import { TagModel } from "../Tag/model.js";

export const resolveTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (({ id: videoId }, { input }) =>
    prisma.videoTag
      .findMany({
        where: { videoId },
        take: input.limit?.valueOf(),
        skip: input.skip.valueOf(),
        include: { tag: true },
        orderBy: {
          createdAt: parseSortOrder(input.order?.createdAt),
          updatedAt: parseSortOrder(input.order?.updatedAt),
        },
      })
      .then((ts) => ts.map(({ tag }) => new TagModel(tag)))) satisfies VideoResolvers["tags"];
