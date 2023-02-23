import { NicovideoRegistrationRequest, NicovideoVideoSource } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const requestRegistration = async (
  prisma: ResolverDeps["prisma"],
  {
    title,
    thumbnailUrl,
    userId,
    sourceId,
    taggings,
    semitaggings,
  }: {
    title: string;
    sourceId: string;
    thumbnailUrl: string;
    userId: string;
    taggings: { tagId: string; note: string | null }[];
    semitaggings: { name: string; note: string | null }[];
  }
): Promise<
  Result<
    | { message: "TAG_NOT_FOUND"; tagId: string }
    | { message: "VIDEO_ALREADY_REGISTERED"; source: NicovideoVideoSource }
    | { message: "INTERNAL_SERVER_ERROR"; error: unknown },
    NicovideoRegistrationRequest
  >
> => {
  try {
    for (const { tagId: id } of taggings) {
      const tag = await prisma.tag.findUnique({ where: { id } });
      if (!tag) return err({ message: "TAG_NOT_FOUND", tagId: id });
    }

    const videoSource = await prisma.nicovideoVideoSource.findUnique({ where: { sourceId } });
    if (videoSource) {
      return err({ message: "VIDEO_ALREADY_REGISTERED", source: videoSource });
    }

    const request = await prisma.nicovideoRegistrationRequest.create({
      data: {
        id: ulid(),
        title,
        thumbnailUrl,
        sourceId,
        requestedById: userId,
        isChecked: false,
        taggings: {
          createMany: {
            data: taggings.map(({ tagId, note }) => ({
              id: ulid(),
              tagId,
              note,
            })),
          },
        },
        semitaggings: {
          createMany: {
            data: semitaggings.map(({ name, note }) => ({
              id: ulid(),
              name,
              note,
            })),
          },
        },
      },
    });

    return ok(request);
  } catch (e) {
    return err({ message: "INTERNAL_SERVER_ERROR", error: e });
  }
};
