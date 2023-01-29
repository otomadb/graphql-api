import { MylistGroupResolvers } from "../graphql.js";
import { ResolverDeps } from "../index.js";
import { MylistGroupVideoAggregationModel } from "../MylistGroupVideoAggregation/model.js";

export const getVideos = async (
  prisma: ResolverDeps["prisma"],
  { groupId, skip, limit }: { groupId: string; skip: number; limit: number }
): Promise<{ videoId: string; count: number }[]> => {
  const videos = await prisma.mylistRegistration.groupBy({
    by: ["videoId"],
    where: { mylist: { includedGroups: { some: { groupId } } } },
    _count: { videoId: true },
    orderBy: { _count: { videoId: "desc" } },
    skip,
    take: limit,
  });
  return videos.map(({ _count, videoId }) => ({ videoId, count: _count.videoId }));
};

export const resolveMylistGroupVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: groupId }, { input }) => {
    const result = await getVideos(prisma, { groupId, limit: input.limit, skip: input.skip });

    return result.map(({ count, videoId }) => new MylistGroupVideoAggregationModel({ count, videoId }));
  }) satisfies MylistGroupResolvers["videos"];
