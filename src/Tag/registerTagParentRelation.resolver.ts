import { TagParent, TagParentEventType } from "@prisma/client";
import { ulid } from "ulid";

import { MutationResolvers, RegisterTagParentRelationOtherErrorMessage, ResolversTypes } from "../resolvers/graphql.js";
import { parseGqlID3 } from "../resolvers/id.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { TagParentDTO } from "./dto.js";

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
  },
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

export const resolverRegisterTagParentRelation = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const parentId = parseGqlID3("Tag", input.parentId);
    if (isErr(parentId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: input.parentId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const childId = parseGqlID3("Tag", input.childId);
    if (isErr(childId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: input.childId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const result = await register(prisma, {
      userId: user.id,
      parentId: parentId.data,
      childId: childId.data,
      isExplicit: input.explicit,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "PARENT_TAG_NOT_FOUND":
        case "CHILD_TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.tagId,
          } satisfies ResolversTypes["MutationTagNotFoundError"];
        case "ALREADY_REGISTERED":
          return {
            __typename: "RegisterTagParentRelationRelationAlreadyRegisteredError",
            relation: new TagParentDTO(result.error.relation),
          } satisfies ResolversTypes["RegisterTagParentRelationRelationAlreadyRegisteredError"];
        case "EXPLICIT_RELATION":
          return {
            __typename: "RegisterTagParentRelationChildTagAlreadyHadExplicitParentError",
            relation: new TagParentDTO(result.error.relation),
          } satisfies ResolversTypes["RegisterTagParentRelationChildTagAlreadyHadExplicitParentError"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagParentRelationOtherErrorsFallback",
            message: RegisterTagParentRelationOtherErrorMessage.InternalServerError,
          } satisfies ResolversTypes["RegisterTagParentRelationOtherErrorsFallback"];
      }
    }

    return {
      __typename: "RegisterTagParentRelationSucceededPayload",
      relation: new TagParentDTO(result.data),
    } satisfies ResolversTypes["RegisterTagParentRelationSucceededPayload"];
  }) satisfies MutationResolvers["registerTagParentRelation"];
