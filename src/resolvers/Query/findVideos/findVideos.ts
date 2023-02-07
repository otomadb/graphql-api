import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { parseSortOrder } from "../../parseSortOrder.js";
import { VideoModel } from "../../Video/model.js";

export const findVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const videos = await prisma.video.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parseSortOrder(input.order?.createdAt),
        updatedAt: parseSortOrder(input.order?.updatedAt),
      },
    });

    return {
      nodes: videos.map((v) => new VideoModel(v)),
    };
  }) satisfies QueryResolvers["findVideos"];
