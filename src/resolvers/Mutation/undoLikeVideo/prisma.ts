import { Mylist, MylistRegistration, MylistShareRange, Video } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const undo = async (
  prisma: ResolverDeps["prisma"],
  { videoId, userId }: { videoId: string; userId: string },
): Promise<
  Result<
    | { type: "VIDEO_NOT_FOUND"; videoId: string }
    | { type: "NOT_LIKED"; mylist: Mylist; video: Video }
    | { type: "ALREADY_REMOVED"; mylist: Mylist; video: Video }
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown },
    MylistRegistration
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
  if (!ext) return err({ type: "NOT_LIKED", video, mylist: likelist });
  if (ext.isRemoved) return err({ type: "ALREADY_REMOVED", mylist: ext.mylist, video: ext.video });
  const registration = await prisma.mylistRegistration.update({
    where: { id: ext.id },
    data: { isRemoved: true, events: { create: { type: "UNREGISTER", userId, payload: {} } } },
  });
  return ok(registration);
};
