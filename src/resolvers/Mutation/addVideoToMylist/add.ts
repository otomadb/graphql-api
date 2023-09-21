import { MylistRegistration } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const add = async (
  prisma: ResolverDeps["prisma"],
  { userId, mylistId, videoId, note }: { userId: string; mylistId: string; videoId: string; note: string | null },
): Promise<
  Result<
    | { message: "MYLIST_NOT_FOUND"; mylistId: string }
    | { message: "MYLIST_WRONG_HOLDER"; mylistId: string }
    | { message: "VIDEO_NOT_FOUND"; videoId: string }
    | { message: "ALREADY_REGISTERED"; registration: MylistRegistration }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    MylistRegistration
  >
> => {
  try {
    const mylist = await prisma.mylist.findUniqueOrThrow({ where: { id: mylistId } });
    if (!mylist.holderId) return err({ message: "MYLIST_NOT_FOUND", mylistId });
    if (mylist.holderId !== userId) return err({ message: "MYLIST_WRONG_HOLDER", mylistId });

    const video = await prisma.video.findUniqueOrThrow({ where: { id: videoId } });
    if (!video) return err({ message: "VIDEO_NOT_FOUND", videoId });

    const already = await prisma.mylistRegistration.findUnique({
      where: { mylistId_videoId: { mylistId: mylist.id, videoId: video.id } },
    });
    if (already) return err({ message: "ALREADY_REGISTERED", registration: already });

    const registration = await prisma.mylistRegistration.create({
      data: {
        id: ulid(),
        videoId: video.id,
        mylistId: mylist.id,
        note,
      },
    });
    return ok(registration);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
