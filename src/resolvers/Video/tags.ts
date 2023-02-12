import { VideoResolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { VideoTagModel } from "../VideoTag/model.js";

export const resolveTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (({ id: videoId }, { input }) =>
    prisma.videoTag
      .findMany({
        where: { videoId, isRemoved: false },
        take: input.limit?.valueOf(),
        skip: input.skip.valueOf(),
        orderBy: { id: "asc" },
      })
      .then((ts) => ts.map((t) => new VideoTagModel(t)))) satisfies VideoResolvers["tags"];
