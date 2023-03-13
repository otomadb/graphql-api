import { CategoryTagType, UserRole } from "@prisma/client";

import { err, isErr, ok, Result } from "../../../utils/Result.js";
import {
  MutationResolvers,
  RegisterCategoryTagTypingOtherErrorMessage,
  ResolversTypes,
  TagType as GqlTagType,
  UserRole as GqlUserRole,
} from "../../graphql.js";
import { parseGqlID3 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";
import { register } from "./register.js";

const convertTagType = (g: GqlTagType): Result<GqlTagType, CategoryTagType> => {
  switch (g) {
    case GqlTagType.Music:
      return ok(CategoryTagType.MUSIC);
    case GqlTagType.Copyright:
      return ok(CategoryTagType.COPYRIGHT);
    case GqlTagType.Character:
      return ok(CategoryTagType.CHARACTER);
    case GqlTagType.Event:
      return ok(CategoryTagType.EVENT);
    case GqlTagType.Phrase:
      return ok(CategoryTagType.PHRASE);
    case GqlTagType.Series:
      return ok(CategoryTagType.SERIES);
    case GqlTagType.Style:
      return ok(CategoryTagType.STYLE);
    case GqlTagType.Tactics:
      return ok(CategoryTagType.TACTICS);
    default:
      return err(g);
  }
};

export const resolverRegisterCategoryTagTyping = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { user }, info) => {
    if (!user || user.role !== UserRole.ADMINISTRATOR)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GqlUserRole.Administrator,
      } satisfies ResolversTypes["MutationAuthenticationError"];

    const tagId = parseGqlID3("Tag", input.tagId);
    if (isErr(tagId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: tagId.error.invalidId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const tagtype = convertTagType(input.type);
    if (isErr(tagtype))
      return {
        __typename: "RegisterCategoryTagTypingUnsupportedTagType",
        type: tagtype.error,
      } satisfies ResolversTypes["RegisterCategoryTagTypingUnsupportedTagType"];

    const result = await register(prisma, {
      userId: user.id,
      tagId: tagId.data,
      type: tagtype.data,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        case "TYPE_ALREADY":
          return {
            __typename: "RegisterCategoryTagTypingAlreadyTypeExistsError",
            already: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingAlreadyTypeExistsError"];
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.id,
          } satisfies ResolversTypes["MutationTagNotFoundError"];
        case "TAG_NOT_CATEGORY_TAG":
          return {
            __typename: "RegisterCategoryTagTypingNotCategoryTagError",
            tag: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingNotCategoryTagError"];
        case "TAG_TYPE_ALREADY":
          return {
            __typename: "RegisterCategoryTagTypingAlreadyTypedError",
            tag: new TagModel(result.error.tag),
          } satisfies ResolversTypes["RegisterCategoryTagTypingAlreadyTypedError"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterCategoryTagTypingOtherErrorsFallback",
            message: RegisterCategoryTagTypingOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterCategoryTagTypingOtherErrorsFallback"];
      }
    }

    const tag = result.data;

    return {
      __typename: "RegisterCategoryTagTypingSucceededPayload",
      tag: new TagModel(tag),
    } satisfies ResolversTypes["RegisterCategoryTagTypingSucceededPayload"];
  }) satisfies MutationResolvers["registerCategoryTagTyping"];
