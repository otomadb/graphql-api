import { CategoryTagType, Tag } from "@prisma/client";
import { GraphQLError } from "graphql";

import { MutationResolvers, ResolversTypes, TypeCategoryTagType } from "../resolvers/graphql.js";
import { parseGqlID3 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { TagDTO } from "./dto.js";

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

const convertPrismaTagType = (g: TypeCategoryTagType): CategoryTagType => {
  switch (g) {
    case TypeCategoryTagType.Character:
      return CategoryTagType.CHARACTER;
    case TypeCategoryTagType.Class:
      return CategoryTagType.CLASS;
    case TypeCategoryTagType.Copyright:
      return CategoryTagType.COPYRIGHT;
    case TypeCategoryTagType.Event:
      return CategoryTagType.EVENT;
    case TypeCategoryTagType.Music:
      return CategoryTagType.MUSIC;
    case TypeCategoryTagType.Phrase:
      return CategoryTagType.PHRASE;
    case TypeCategoryTagType.Series:
      return CategoryTagType.SERIES;
    case TypeCategoryTagType.Style:
      return CategoryTagType.STYLE;
    case TypeCategoryTagType.Tactics:
      return CategoryTagType.TACTICS;
  }
};

export const resolverRegisterCategoryTagTyping = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const tagId = parseGqlID3("Tag", input.tagId);
    if (isErr(tagId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: tagId.error.invalidId,
      } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];

    const tagtype = convertPrismaTagType(input.type);

    const result = await register(prisma, {
      userId: user.id,
      tagId: tagId.data,
      type: tagtype,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        case "TYPE_ALREADY":
          return {
            __typename: "RegisterCategoryTagTypingAlreadyTypeExistsError",
            already: new TagDTO(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.id,
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_NOT_CATEGORY_TAG":
          return {
            __typename: "RegisterCategoryTagTypingNotCategoryTagError",
            tag: new TagDTO(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_TYPE_ALREADY":
          return {
            __typename: "RegisterCategoryTagTypingAlreadyTypedError",
            tag: new TagDTO(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          throw new GraphQLError("Internal server error");
      }
    }

    const tag = result.data;

    return {
      __typename: "RegisterCategoryTagTypingSucceededPayload",
      tag: new TagDTO(tag),
    } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
  }) satisfies MutationResolvers["registerCategoryTagTyping"];
