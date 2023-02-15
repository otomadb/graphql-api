import {
  Prisma,
  Semitag,
  SemitagEventType,
  Tag,
  TagEventType,
  TagNameEventType,
  TagParentEventType,
  UserRole,
  VideoTagEventType,
} from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";
import { ulid } from "ulid";

import { err, Result } from "../../../utils/Result.js";
import { MutationResolvers, RegisterTagFailedMessage } from "../../graphql.js";
import { parseGqlID2, parseGqlIDs2 } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

export const registerTagInNeo4j = async (neo4j: ResolverDeps["neo4j"], rels: { videoId: string; tagId: string }[]) => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    for (const rel of rels) {
      const tagId = rel.videoId;
      const videoId = rel.tagId;
      tx.run(
        `
          MERGE (v:Video {id: $video_id})
          MERGE (t:Tag {id: $tag_id})
          MERGE r=(v)-[:TAGGED_BY]->(t)
          RETURN r
          `,
        { tag_id: tagId, video_id: videoId }
      );
    }
    await tx.commit();
  } finally {
    await session.close();
  }
};

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
                videoTag: {
                  create: {
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
    return {
      status: "ok",
      data: tag,
    };
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};

export const logGraphQLResolveInfo = (info: GraphQLResolveInfo) => ({
  parentType: info.parentType.toJSON(),
  fieldName: info.fieldName,
  variables: info.variableValues,
});

export const registerTag = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "neo4j" | "logger">) =>
  (async (_: unknown, { input }, { user }, info) => {
    if (!user || (user.role !== UserRole.EDITOR && user.role !== UserRole.ADMINISTRATOR))
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.Forbidden,
      };

    const explicitParent = input.explicitParent ? parseGqlID2("Tag", input.explicitParent) : null;
    if (explicitParent?.status === "error")
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.InvalidTagId, // TODO: 詳細なエラーを返すようにする
      };

    const resolveSemitags = parseGqlIDs2("Semitag", input.resolveSemitags);
    if (resolveSemitags?.status === "error")
      return {
        __typename: "RegisterTagFailedPayload",
        message: RegisterTagFailedMessage.InvalidSemitagId, // TODO: 詳細なエラーを返すようにする
      };

    const result = await register(prisma, {
      userId: user.id,
      explicitParentId: explicitParent ? explicitParent.data : null,
      implicitParentIds: [],
      semitagIds: resolveSemitags.data,
      primaryName: input.primaryName,
      extraNames: input.extraNames,
      meaningless: input.meaningless,
    });

    if (result.status === "error") {
      switch (result.error.type) {
        case "COLLIDE_BETWEEN_EXPLICIT_PARENT_AND_IMPLICIT_PARENTS":
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.InvalidTagId,
          };
        case "DUPLICATE_IN_IMPLICIT_PARENTS":
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.InvalidTagId,
          };
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.Unknown,
          };
        default:
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.Unknown,
          };
      }
    }
    const tag = result.data;
    return {
      __typename: "RegisterTagSucceededPayload",
      tag: new TagModel(tag),
    };
  }) satisfies MutationResolvers["registerTag"];
