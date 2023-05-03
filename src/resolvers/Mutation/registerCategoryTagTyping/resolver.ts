import { CategoryTagType } from "@prisma/client";
import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { MutationResolvers, ResolversTypes, TypeCategoryTagType } from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { TagModel } from "../../Tag/model.js";
import { ResolverDeps } from "../../types.js";
import { register } from "./register.js";

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
            already: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.id,
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_NOT_CATEGORY_TAG":
          return {
            __typename: "RegisterCategoryTagTypingNotCategoryTagError",
            tag: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "TAG_TYPE_ALREADY":
          return {
            __typename: "RegisterCategoryTagTypingAlreadyTypedError",
            tag: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          throw new GraphQLError("Internal server error");
      }
    }

    const tag = result.data;

    return {
      __typename: "RegisterCategoryTagTypingSucceededPayload",
      tag: new TagModel(tag),
    } satisfies ResolversTypes["RegisterCategoryTagTypingResultUnion"];
  }) satisfies MutationResolvers["registerCategoryTagTyping"];
