import { QueryResolvers } from "../../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

export const findVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const videos = await prisma.video.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        // TODO: PRISMA
        createdAt: "asc",
        /*
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
        */
      },
    });

    return {
      nodes: videos.map((v) => new VideoModel(v)),
    };
  }) satisfies QueryResolvers["findVideos"];
