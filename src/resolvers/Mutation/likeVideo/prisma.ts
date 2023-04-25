import { MylistRegistration, MylistShareRange } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const like = async (
  prisma: ResolverDeps["prisma"],
  { videoId, userId }: { videoId: string; userId: string }
): Promise<
  Result<
    | { type: "VIDEO_NOT_FOUND"; videoId: string }
    | { type: "ALREADY_REGISTERED"; registration: MylistRegistration }
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
  });

  if (ext) {
    if (!ext.isRemoved) return err({ type: "ALREADY_REGISTERED", registration: ext });
    const registration = await prisma.mylistRegistration.update({
      where: { id: ext.id },
      data: { isRemoved: false, events: { create: { type: "REREGISTER", userId, payload: {} } } },
    });
    return ok(registration);
  }

  const registration = await prisma.mylistRegistration.create({
    data: {
      id: ulid(),
      videoId: video.id,
      mylistId: likelist.id,
      isRemoved: false,
      events: { create: { type: "REGISTER", userId, payload: {} } },
    },
  });
  return ok(registration);
};
