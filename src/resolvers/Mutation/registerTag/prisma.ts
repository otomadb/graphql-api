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

    const transactionSemitag: Prisma.Prisma__SemitagClient<Semitag>[] = [];
    for (const semitagId of semitagIds) {
      const semitag = await prisma.semitag.findUnique({ where: { id: semitagId }, select: { videoId: true } });
      if (!semitag) return err({ type: "SEMITAG_NOT_FOUND", id: semitagId });

      transactionSemitag.push(
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

    const dataNames = [
      { id: ulid(), name: primaryName, isPrimary: true },
      ...extraNames.map((extraName) => ({
        id: ulid(),
        name: extraName,
        isPrimary: false,
      })),
    ];
    const dataExplicitParent = explicitParentId ? { id: ulid(), parentId: explicitParentId, isExplicit: true } : null;
    const dataImplicitParents = implicitParentIds.map((implicitParentId) => ({
      id: ulid(),
      parentId: implicitParentId,
      isExplicit: false,
    }));

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          meaningless,
          names: { createMany: { data: dataNames } },
          parents: {
            createMany: {
              data: [...(dataExplicitParent ? [dataExplicitParent] : []), ...dataImplicitParents],
            },
          },
          events: {
            create: {
              userId,
              type: TagEventType.REGISTER,
              payload: {},
            },
          },
        },
      }),
      prisma.tagNameEvent.createMany({
        data: [
          ...dataNames.map(
            ({ id }) =>
              ({
                userId,
                type: TagNameEventType.CREATE,
                tagNameId: id,
                payload: {},
              } satisfies Prisma.TagNameEventCreateManyInput)
          ),
          {
            userId,
            tagNameId: dataNames[0].id,
            type: TagNameEventType.SET_PRIMARY,
            payload: {},
          },
        ],
      }),
      ...(dataExplicitParent
        ? [
            prisma.tagParentEvent.createMany({
              data: [
                {
                  userId,
                  type: TagParentEventType.CREATE,
                  tagParentId: dataExplicitParent.id,
                  payload: {},
                },
                {
                  userId,
                  type: TagParentEventType.SET_PRIMARY,
                  tagParentId: dataExplicitParent.id,
                  payload: {},
                },
              ],
            }),
          ]
        : []),
      prisma.tagParentEvent.createMany({
        data: [
          ...dataImplicitParents.map(
            ({ id }) =>
              ({
                userId,
                type: TagParentEventType.CREATE,
                tagParentId: id,
                payload: {},
              } satisfies Prisma.TagParentEventCreateManyInput)
          ),
        ],
      }),
      ...transactionSemitag,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
