import { Tag, UserRole } from "@prisma/client";
import { ulid } from "ulid";

import { Result } from "../../../utils/Result.js";
import { MutationResolvers, RegisterTagFailedMessage } from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
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
    extraNames,
    meaningless,
    primaryName,
    explicitParentId,
    implicitParentIds,
    semitagIds,
  }: {
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
    | { type: "DUPLICATE_IN_IMPLICIT_PARENTS"; id: string },
    Tag
  >
> => {
  if (explicitParentId && implicitParentIds.includes(explicitParentId))
    return {
      status: "error",
      error: { type: "COLLIDE_BETWEEN_EXPLICIT_PARENT_AND_IMPLICIT_PARENTS", id: explicitParentId },
    };

  const duplicatedImplicitId = implicitParentIds.find((id, i, arr) => arr.indexOf(id) !== i);
  if (duplicatedImplicitId)
    return {
      status: "error",
      error: { type: "DUPLICATE_IN_IMPLICIT_PARENTS", id: duplicatedImplicitId },
    };

  // const semitagVideos = await prisma.video.findMany({ where: { semitags: { some: { id: { in: semitagIds } } } } });

  const tagId = ulid();
  const [tag] = await prisma.$transaction([
    prisma.tag.create({
      data: {
        id: tagId,
        meaningless,
        names: {
          createMany: {
            data: [
              { name: primaryName, isPrimary: true },
              ...extraNames.map((extraName) => ({ name: extraName, isPrimary: false })),
            ],
          },
        },
        parents: {
          createMany: {
            data: [
              ...(explicitParentId ? [{ parentId: explicitParentId, isExplicit: true }] : []),
              ...implicitParentIds.map((implicitParentId) => ({ parentId: implicitParentId, isExplicit: false })),
            ],
          },
        },
      },
    }),
    // TODO: Semitagの処理
  ]);
  return {
    status: "ok",
    data: tag,
  };
};

export const registerTag = ({ prisma }: Pick<ResolverDeps, "prisma" | "neo4j">) =>
  (async (_: unknown, { input }, { user }) => {
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

    const result = await register(prisma, {
      explicitParentId: explicitParent ? explicitParent.data : null,
      implicitParentIds: [],
      semitagIds: [],
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
        default:
          return {
            __typename: "RegisterTagFailedPayload",
            message: RegisterTagFailedMessage.Unknown,
          };
      }
    }
    const tag = result.data;
    return {
      __typename: "RegisterTagSuccessedPayload",
      tag: new TagModel(tag),
    };
  }) satisfies MutationResolvers["registerTag"];
