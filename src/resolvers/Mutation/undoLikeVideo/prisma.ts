import { MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const undo = async (
  prisma: ResolverDeps["prisma"],
  { videoId, userId }: { videoId: string; userId: string },
): Promise<
  Result<
    { type: "VIDEO_NOT_FOUND"; videoId: string } | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    Record<string, never>
  >
> => {
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) return err({ type: "VIDEO_NOT_FOUND", videoId });

  const likelist = await prisma.mylist.upsert({
    where: { holderId_slug: { holderId: userId, slug: "likes" } },
    create: {
      holderId: userId,
      slug: "likes",
      title: "likes",
      shareRange: MylistShareRange.PRIVATE,
    },
    update: {},
  });
  const ext = await prisma.mylistRegistration.findUnique({
    where: {
      mylistId_videoId: {
        mylistId: likelist.id,
        videoId: video.id,
      },
    },
    include: {
      video: true,
      mylist: true,
    },
  });
  if (!ext || ext.isRemoved) return ok({});

  await prisma.mylistRegistration.update({
    where: { id: ext.id },
    data: { isRemoved: true, events: { create: { type: "UNREGISTER", userId, payload: {} } } },
  });
  return ok({});
};
