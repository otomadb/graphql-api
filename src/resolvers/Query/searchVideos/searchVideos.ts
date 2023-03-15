import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { VideoModel } from "../../Video/model.js";

export const searchVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_, { input }) => {
    const videos = await prisma.videoTitle.findMany({
      where: { title: { contains: input.query } },
      distinct: "videoId",
      include: { video: true },
      skip: input.skip || undefined,
      take: input.limit || undefined,
    });
    return {
      items: videos.map((t) => {
        return {
          matchedTitle: t.title,
          video: new VideoModel(t.video),
        };
      }),
    };
  }) satisfies QueryResolvers["searchVideos"];
