import { parsePrismaOrder } from "../../../utils/parsePrismaOrder.js";
import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const findVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const videos = await prisma.video.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parsePrismaOrder(input.order?.createdAt),
        updatedAt: parsePrismaOrder(input.order?.updatedAt),
      },
    });

    return {
      nodes: videos.map((v) => new VideoModel(v)),
    };
  }) satisfies QueryResolvers["findVideos"];
