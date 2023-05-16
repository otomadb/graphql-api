import { Resolvers, TypeCategoryTagType } from "../graphql.js";
import { TagModel } from "../Tag/model.js";
import { ResolverDeps } from "../types.js";

export const resolverTypeCategoryTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  ({
    tag: ({ tagId }) => prisma.tag.findUniqueOrThrow({ where: { id: tagId } }).then((t) => TagModel.fromPrisma(t)),
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
