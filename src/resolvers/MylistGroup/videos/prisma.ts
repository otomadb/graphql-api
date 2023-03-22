import { ResolverDeps } from "../../types.js";

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
