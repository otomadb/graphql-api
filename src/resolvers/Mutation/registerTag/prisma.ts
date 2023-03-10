import {
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
    primaryName,
    explicitParentId,
    implicitParentIds,
    semitagIds,
  }: {
    userId: string;
    primaryName: string;
    extraNames: string[];

    explicitParentId: string | null;
    implicitParentIds: string[];

    semitagIds: string[];
  }
): Promise<
  Result<
    | { type: "TAG_NOT_FOUND"; id: string }
    | { type: "SEMITAG_NOT_FOUND"; id: string }
    | { type: "SEMITAG_ALREADY_CHECKED"; id: string }
    | { type: "UNKNOWN"; error: unknown },
    Tag
  >
> => {
  try {
    const tagId = ulid();

    const $primaryName = prisma.tagName.create({
      data: {
        tagId,
        id: ulid(),
        name: primaryName,
        isPrimary: true,
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
    const $extraNames = extraNames.map((extraName) =>
      prisma.tagName.create({
        data: {
          tagId,
          id: ulid(),
          name: extraName,
          isPrimary: false,
          events: {
            createMany: {
              data: [{ userId, type: TagNameEventType.CREATE, payload: {} }],
            },
          },
        },
      })
    );

    const explicitParent = explicitParentId ? await prisma.tag.findUnique({ where: { id: explicitParentId } }) : null;
    if (explicitParentId && !explicitParent) return err({ type: "TAG_NOT_FOUND", id: explicitParentId });
    const $explicitParent = explicitParent
      ? prisma.tagParent.create({
          data: {
            id: ulid(),
            parentId: explicitParent.id,
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

    const implicitParents = await prisma.tag.findMany({ where: { id: { in: implicitParentIds } } });
    const missingImplicitParentid = implicitParentIds.find(
      (id) => !implicitParents.find((implicitParent) => implicitParent.id === id)
    );
    if (missingImplicitParentid) return err({ type: "TAG_NOT_FOUND", id: missingImplicitParentid });
    const $implicitParents = implicitParents.map(({ id: parentId }) =>
      prisma.tagParent.create({
        data: {
          id: ulid(),
          parentId,
          childId: tagId,
          isExplicit: false,
          events: {
            createMany: {
              data: [{ userId, type: TagParentEventType.CREATE, payload: {} }],
            },
          },
        },
      })
    );

    const semitags = await prisma.semitag.findMany({ where: { id: { in: semitagIds } } });
    const missingSemitagId = semitagIds.find((id) => !semitags.find((semitag) => semitag.id === id));
    if (missingSemitagId) return err({ type: "SEMITAG_NOT_FOUND", id: missingSemitagId });
    const checkedSemitag = semitags.find((semitag) => semitag.isChecked);
    if (checkedSemitag) return err({ type: "SEMITAG_ALREADY_CHECKED", id: checkedSemitag.id });
    const $semitags = semitags.map((semitag) =>
      prisma.semitag.update({
        where: { id: semitag.id },
        data: {
          isChecked: true,
          events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
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

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless: false,
          events: { create: { userId, type: TagEventType.REGISTER, payload: {} } },
        },
      }),
      $primaryName,
      ...$extraNames,
      ...($explicitParent ? [$explicitParent] : []),
      ...$implicitParents,
      ...$semitags,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
