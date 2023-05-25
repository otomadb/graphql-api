import { Resolvers, TypeCategoryTagType } from "../resolvers/graphql.js";
import { ResolverDeps } from "../resolvers/types.js";
import { TagDTO } from "./dto.js";

export const resolverTypeCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    tag: ({ tagId }) => prisma.tag.findUniqueOrThrow({ where: { id: tagId } }).then((t) => TagDTO.fromPrisma(t)),
    type({ type }) {
      switch (type) {
        case "CHARACTER":
          return TypeCategoryTagType.Character;
        case "CLASS":
          return TypeCategoryTagType.Class;
        case "COPYRIGHT":
          return TypeCategoryTagType.Copyright;
        case "EVENT":
          return TypeCategoryTagType.Event;
        case "MUSIC":
          return TypeCategoryTagType.Music;
        case "PHRASE":
          return TypeCategoryTagType.Phrase;
        case "SERIES":
          return TypeCategoryTagType.Series;
        case "STYLE":
          return TypeCategoryTagType.Style;
        case "TACTICS":
          return TypeCategoryTagType.Tactics;
      }
    },
  } satisfies Resolvers["TypeCategoryTag"]);
