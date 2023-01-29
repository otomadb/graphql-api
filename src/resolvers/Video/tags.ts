import { parsePrismaOrder } from "../../utils/parsePrismaOrder.js";
import { VideoResolvers } from "../graphql.js";
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
          createdAt: parsePrismaOrder(input.order?.createdAt),
          updatedAt: parsePrismaOrder(input.order?.updatedAt),
        },
      })
      .then((ts) => ts.map(({ tag }) => new TagModel(tag)))) satisfies VideoResolvers["tags"];
