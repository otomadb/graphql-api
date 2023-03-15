import { CategoryTagType, Tag } from "@prisma/client";

import { err, ok, Result } from "../../../utils/Result.js";
import { ResolverDeps } from "../../types.js";

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    tagId,
    type,
  }: {
    userId: string;
    tagId: string;
    type: CategoryTagType;
  }
): Promise<
  Result<
    | { type: "UNKNOWN"; error: unknown }
    | { type: "TYPE_ALREADY"; tag: Tag }
    | { type: "TAG_NOT_FOUND"; id: string }
    | { type: "TAG_NOT_CATEGORY_TAG"; tag: Tag }
    | { type: "TAG_TYPE_ALREADY"; tag: Tag },
    Tag
  >
> => {
  try {
    const already = await prisma.categoryTagTyping.findUnique({ where: { type }, select: { tag: true } });
    if (already) return err({ type: "TYPE_ALREADY", tag: already.tag });

    const category = await prisma.tag.findUnique({ where: { id: tagId }, include: { categoryType: true } });
    if (!category) return err({ type: "TAG_NOT_FOUND", id: tagId });
    if (!category.isCategoryTag) return err({ type: "TAG_NOT_CATEGORY_TAG", tag: category });
    if (category.categoryType) return err({ type: "TAG_TYPE_ALREADY", tag: category });

    const typing = await prisma.categoryTagTyping.create({
      data: { type, tagId: category.id, createdById: userId },
      select: { tag: true },
    });
    return ok(typing.tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};
