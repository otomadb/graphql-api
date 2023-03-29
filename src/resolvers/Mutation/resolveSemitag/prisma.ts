import { Semitag, SemitagEventType, VideoTag, VideoTagEventType } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const resolve = async (
  prisma: ResolverDeps["prisma"],
  { userId, semitagId, tagId }: { userId: string; semitagId: string; tagId: string }
): Promise<
  Result<
    | { type: "INTERNAL_SERVER_ERROR"; error: unknown }
    | { type: "SEMITAG_NOT_FOUND"; semitagId: string }
    | { type: "TAG_NOT_FOUND"; tagId: string }
    | { type: "SEMITAG_ALREADY_CHECKED"; semitag: Semitag }
    | { type: "VIDEO_ALREADY_TAGGED"; tagging: VideoTag },
    { videoTagId: string; note: null; semitagId: string }
  >
> => {
  try {
    const checkedSemitag = await prisma.semitag.findUnique({ where: { id: semitagId } });
    if (!checkedSemitag) return err({ type: "SEMITAG_NOT_FOUND", semitagId });
    if (checkedSemitag.isChecked) return err({ type: "SEMITAG_ALREADY_CHECKED", semitag: checkedSemitag });

    const checkedTag = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!checkedTag) return err({ type: "TAG_NOT_FOUND", tagId });

    const alreadyTagging = await prisma.videoTag.findUnique({
      where: { videoId_tagId: { tagId: checkedTag.id, videoId: checkedSemitag.videoId } },
    });
    if (alreadyTagging) return err({ type: "VIDEO_ALREADY_TAGGED", tagging: alreadyTagging });

    const videoTagId = ulid();
    await prisma.semitag.update({
      where: { id: checkedSemitag.id },
      data: {
        isChecked: true,
        events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
        checking: {
          create: {
            id: ulid(),
            videoTag: {
              create: {
                id: videoTagId,
                tag: { connect: { id: tagId } },
                video: { connect: { id: checkedSemitag.videoId } },
                events: { create: { userId, type: VideoTagEventType.ATTACH, payload: {} } },
              },
            },
          },
        },
      },
    });

    return ok({ videoTagId, note: null, semitagId: checkedSemitag.id });
  } catch (e) {
    return err({ type: "INTERNAL_SERVER_ERROR", error: e });
  }
};
