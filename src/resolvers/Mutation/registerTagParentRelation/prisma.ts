import { TagParent, TagParentEventType } from "@prisma/client";
import { ulid } from "ulid";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../index.js";

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    parentId,
    childId,
    isExplicit,
  }: {
    userId: string;
    parentId: string;
    childId: string;
    isExplicit: boolean;
  }
): Promise<
  Result<
    | { type: "PARENT_TAG_NOT_FOUND"; tagId: string }
    | { type: "CHILD_TAG_NOT_FOUND"; tagId: string }
    | { type: "ALREADY_REGISTERED"; relation: TagParent }
    | { type: "EXPLICIT_RELATION"; relation: TagParent }
    | { type: "UNKNOWN"; error: unknown },
    TagParent
  >
> => {
  try {
    const parent = await prisma.tag.findUnique({
      where: { id: parentId },
    });
    if (!parent) return err({ type: "PARENT_TAG_NOT_FOUND", tagId: parentId });

    const child = await prisma.tag.findUnique({
      where: { id: childId },
    });
    if (!child) return err({ type: "CHILD_TAG_NOT_FOUND", tagId: childId });

    const duplRelation = await prisma.tagParent.findUnique({
      where: { parentId_childId: { parentId: parent.id, childId: child.id } },
    });
    if (duplRelation) return err({ type: "ALREADY_REGISTERED", relation: duplRelation });

    const childExpl = await prisma.tagParent.findFirst({
      where: { childId: child.id, isExplicit: true },
    });
    if (isExplicit && childExpl) return err({ type: "EXPLICIT_RELATION", relation: childExpl });

    const tp = await prisma.tagParent.create({
      data: {
        id: ulid(),
        childId: child.id,
        parentId: parent.id,
        isExplicit,
        events: {
          createMany: {
            data: [
              {
                userId,
                type: TagParentEventType.CREATE,
                payload: {},
              },
              ...(isExplicit ? [{ userId, type: TagParentEventType.SET_PRIMARY, payload: {} }] : []),
            ],
          },
        },
      },
    });
    return ok(tp);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
