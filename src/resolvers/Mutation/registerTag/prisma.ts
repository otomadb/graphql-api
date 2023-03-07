import {
  Prisma,
  Semitag,
  SemitagEventType,
  Tag,
  TagEventType,
  TagNameEventType,
  TagParentEventType,
  VideoTagEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    extraNames,
    meaningless,
    primaryName,
    explicitParentId,
    implicitParentIds,
    semitagIds,
  }: {
    userId: string;
    primaryName: string;
    extraNames: string[];

    meaningless: boolean;

    explicitParentId: string | null;
    implicitParentIds: string[];

    semitagIds: string[];
  }
): Promise<
  Result<
    | { type: "COLLIDE_BETWEEN_EXPLICIT_PARENT_AND_IMPLICIT_PARENTS"; id: string }
    | { type: "DUPLICATE_IN_IMPLICIT_PARENTS"; id: string }
    | { type: "DUPLICATE_IN_SEMITAG_IDS"; id: string }
    | { type: "SEMITAG_NOT_FOUND"; id: string }
    | { type: "UNKNOWN"; error: unknown },
    Tag
  >
> => {
  try {
    if (explicitParentId && implicitParentIds.includes(explicitParentId))
      return err({ type: "COLLIDE_BETWEEN_EXPLICIT_PARENT_AND_IMPLICIT_PARENTS", id: explicitParentId });

    const duplicatedImplicitId = implicitParentIds.find((id, i, arr) => arr.indexOf(id) !== i);
    if (duplicatedImplicitId) return err({ type: "DUPLICATE_IN_IMPLICIT_PARENTS", id: duplicatedImplicitId });

    const duplicatedSemitagId = semitagIds.find((id, i, arr) => arr.indexOf(id) !== i);
    if (duplicatedSemitagId) return err({ type: "DUPLICATE_IN_SEMITAG_IDS", id: duplicatedSemitagId });

    const tagId = ulid();

    const $semitags: Prisma.Prisma__SemitagClient<Semitag>[] = [];
    for (const semitagId of semitagIds) {
      const semitag = await prisma.semitag.findUnique({ where: { id: semitagId }, select: { videoId: true } });
      if (!semitag) return err({ type: "SEMITAG_NOT_FOUND", id: semitagId });
      $semitags.push(
        prisma.semitag.update({
          where: { id: semitagId },
          data: {
            events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
            isChecked: true,
            checking: {
              create: {
                id: ulid(),
                videoTag: {
                  create: {
                    id: ulid(),
                    tag: { connect: { id: tagId } },
                    video: { connect: { id: semitag.videoId } },
                    events: { create: { userId, type: VideoTagEventType.ATTACH, payload: {} } },
                  },
                },
              },
            },
          },
        })
      );
    }

    const $primaryName = prisma.tagName.create({
      data: {
        id: ulid(),
        name: primaryName,
        isPrimary: true,
        tagId,
        events: {
          createMany: {
            data: [
              { userId, type: TagNameEventType.CREATE, payload: {} },
              { userId, type: TagNameEventType.SET_PRIMARY, payload: {} },
            ],
          },
        },
      },
    });
    const $extraNames = prisma.tagName.createMany({
      data: extraNames.map((extraName) => ({
        id: ulid(),
        name: extraName,
        isPrimary: false,
        tagId,
        events: {
          createMany: {
            data: [{ userId, type: TagNameEventType.CREATE, payload: {} }],
          },
        },
      })),
    });
    const $explicitParent = explicitParentId
      ? prisma.tagParent.create({
          data: {
            id: ulid(),
            parentId: explicitParentId,
            childId: tagId,
            isExplicit: true,
            events: {
              createMany: {
                data: [
                  { userId, type: TagParentEventType.CREATE, payload: {} },
                  { userId, type: TagParentEventType.SET_PRIMARY, payload: {} },
                ],
              },
            },
          },
        })
      : null;
    const $implicitParents = prisma.tagParent.createMany({
      data: implicitParentIds.map((implicitParentId) => ({
        id: ulid(),
        parentId: implicitParentId,
        childId: tagId,
        isExplicit: false,
        events: {
          createMany: {
            data: [{ userId, type: TagParentEventType.CREATE, payload: {} }],
          },
        },
      })),
    });

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless,
          events: { create: { userId, type: TagEventType.REGISTER, payload: {} } },
        },
      }),
      $primaryName,
      $extraNames,
      ...($explicitParent ? [$explicitParent] : []),
      $implicitParents,
      ...$semitags,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
