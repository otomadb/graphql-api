import { Tag, Video, VideoTag, VideoTagEventType } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const remove = async (
  prisma: ResolverDeps["prisma"],
  { authUserId, videoId, tagId }: { authUserId: string; videoId: string; tagId: string }
): Promise<Result<"NO_TAG" | "NO_TAGGING" | "NO_VIDEO" | "REMOVED_TAGGING", VideoTag & { video: Video; tag: Tag }>> => {
  if ((await prisma.video.findUnique({ where: { id: videoId } })) === null) return err("NO_VIDEO");
  if ((await prisma.tag.findUnique({ where: { id: tagId } })) === null) return err("NO_TAG");

  const extTagging = await prisma.videoTag.findUnique({ where: { videoId_tagId: { tagId, videoId } } });
  if (extTagging === null) return err("NO_TAGGING");
  if (extTagging.isRemoved) return err("REMOVED_TAGGING");

  const tagging = await prisma.videoTag.update({
    where: { id: extTagging.id },
    data: {
      isRemoved: true,
      events: {
        create: {
          userId: authUserId,
          type: VideoTagEventType.DETACH,
          payload: {},
        },
      },
    },
    include: { tag: true, video: true },
  });
  return ok(tagging);
};
