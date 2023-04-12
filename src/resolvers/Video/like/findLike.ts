import { MylistRegistration, MylistShareRange } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const findLike = async (
  prisma: ResolverDeps["prisma"],
  { videoId, holderId }: { videoId: string; holderId: string }
): Promise<Result<{ type: "UNKNOWN_ERROR"; error: unknown }, MylistRegistration | null>> => {
  try {
    const likelist = await prisma.mylist.upsert({
      where: { holderId_slug: { holderId, slug: "likes" } },
      create: {
        holderId,
        slug: "likes",
        title: "likes",
        shareRange: MylistShareRange.PRIVATE,
        isLikeList: false,
      },
      update: {},
    });
    const registration = await prisma.mylistRegistration.findUnique({
      where: { mylistId_videoId: { mylistId: likelist.id, videoId } },
    });
    return ok(registration);
  } catch (error) {
    return err({ type: "UNKNOWN_ERROR", error });
  }
};
