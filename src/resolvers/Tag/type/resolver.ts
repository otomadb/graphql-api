import { CategoryTagType } from "@prisma/client";

import { TagResolvers, TagType as GqlTagType } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";

export const resolveTagType = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: tagId }) => {
    const typings = await prisma.tagParent
      .findMany({
        where: { childId: tagId, parent: { isCategoryTag: true } },
        select: { parent: { select: { categoryType: { select: { type: true } } } } },
      })
      .then((t) =>
        t.map(({ parent: { categoryType } }) => categoryType?.type).filter((t): t is CategoryTagType => !!t)
      );

    if (1 < typings.length) return GqlTagType.Subtle;
    if (0 === typings.length) return GqlTagType.Unknown;
    switch (typings[0]) {
      case CategoryTagType.MUSIC:
        return GqlTagType.Music;
      case CategoryTagType.COPYRIGHT:
        return GqlTagType.Copyright;
      case CategoryTagType.CHARACTER:
        return GqlTagType.Character;
      case CategoryTagType.PHRASE:
        return GqlTagType.Phrase;
      case CategoryTagType.SERIES:
        return GqlTagType.Series;
      case CategoryTagType.TACTICS:
        return GqlTagType.Tactics;
      case CategoryTagType.STYLE:
        return GqlTagType.Style;
      case CategoryTagType.EVENT:
        return GqlTagType.Event;
      default:
        return GqlTagType.Unknown;
    }
  }) satisfies TagResolvers["type"];
