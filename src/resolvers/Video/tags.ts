import { VideoResolvers } from "../../graphql.js";
import { ResolverDeps } from "../index.js";
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
          // TODO: fix for Prisma
          createdAt: "asc",
          // createdAt: input.order.createdAt || undefined,
          // createdAt: input.order.createdAt || undefined,
          // updatedAt: input.order.updatedAt || undefined,
        },
      })
      .then((ts) => ts.map(({ tag }) => new TagModel(tag)))) satisfies VideoResolvers["tags"];
