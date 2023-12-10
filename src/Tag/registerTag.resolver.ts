import {
  SemitagEventType,
  Tag,
  TagEventType,
  TagNameEventType,
  TagParentEventType,
  VideoTagEventType,
} from "@prisma/client";
import { ulid } from "ulid";

import { MutationResolvers, RegisterTagOtherErrorsFallbackMessage, ResolversTypes } from "../resolvers/graphql.js";
import { buildGqlId, parseGqlID3, parseGqlIDs3 } from "../resolvers/id.js";
import { updateWholeVideoTags } from "../resolvers/Mutation/resolveSemitag/neo4j.js";
import { ResolverDeps } from "../resolvers/types.js";
import { err, isErr, ok, Result } from "../utils/Result.js";
import { TagDTO } from "./dto.js";

export const addTagToMeiliSearch = async (
  { prisma, meilisearch }: Pick<ResolverDeps, "prisma" | "meilisearch">,
  tagId: string,
): Promise<Result<{ type: "INTERNAL_ERROR"; error: unknown }, void>> => {
  try {
    const index = await meilisearch.getIndex<{ id: string; name: string; tag_id: string }>("tags");
    const names = await prisma.tagName.findMany({ where: { tagId } });
    await index.addDocuments(names.map(({ id, tagId, name }) => ({ id, tag_id: tagId, name })));
    return ok(undefined);
  } catch (e) {
    return err({ type: "INTERNAL_ERROR", error: e });
  }
};

export const registerTagInNeo4j = async (
  { prisma, neo4j }: Pick<ResolverDeps, "prisma" | "neo4j">,
  tagId: string,
): Promise<Result<unknown, true>> => {
  const session = neo4j.session();
  try {
    const tx = session.beginTransaction();
    for (const { id } of await prisma.videoTag.findMany({ where: { tagId } })) {
      await updateWholeVideoTags({ prisma, tx }, id);
    }

    const parents = await prisma.tagParent.findMany({ where: { childId: tagId } });
    for (const { parentId, childId, isExplicit } of parents) {
      tx.run(
        `
        MERGE (p:Tag {uid: $parent_id})
        MERGE (c:Tag {uid: $child_id})
        MERGE (p)-[r:PARENT_OF {explicit: $explicit}]->(c)
        RETURN r
        `,
        {
          parent_id: parentId,
          child_id: childId,
          explicit: isExplicit,
        },
      );
    }

    /* TODO: SemitagをNeo4j内でどう扱うかは未定
    const checkings = await prisma.semitagChecking.findMany({
      where: { videoTag: { tagId } },
      include: { semitag: true, videoTag: true },
    });
    for (const { videoTag } of checkings) {
      if (videoTag)
        tx.run(
          `
          MERGE (v:Video {id: $video_id})
          MERGE (t:Tag {id: $tag_id})
          MERGE r=(v)-[:TAGGED_BY]->(t)
          RETURN r
          `,
          {
            tag_id: videoTag.tagId,
            video_id: videoTag.videoId,
          }
        );
    }
    */

    await tx.commit();
    return ok(true);
  } catch (e) {
    return err(e);
  } finally {
    await session.close();
  }
};

export const register = async (
  prisma: ResolverDeps["prisma"],
  {
    userId,
    extraNames,
    primaryName,
    explicitParentId,
    implicitParentIds,
    semitagIds,
  }: {
    userId: string;
    primaryName: string;
    extraNames: string[];

    explicitParentId: string | null;
    implicitParentIds: string[];

    semitagIds: string[];
  },
): Promise<
  Result<
    | { type: "TAG_NOT_FOUND"; id: string }
    | { type: "SEMITAG_NOT_FOUND"; id: string }
    | { type: "SEMITAG_ALREADY_CHECKED"; id: string }
    | { type: "UNKNOWN"; error: unknown },
    Tag
  >
> => {
  try {
    const tagId = ulid();

    const $primaryName = prisma.tagName.create({
      data: {
        tagId,
        id: ulid(),
        name: primaryName,
        isPrimary: true,
        events: {
          createMany: {
            data: [
              { userId, type: TagNameEventType.CREATE, payload: {} },
              { userId, type: TagNameEventType.SET_PRIMARY, payload: {} },
            ],
          },
        },
      },
    });
    const $extraNames = extraNames.map((extraName) =>
      prisma.tagName.create({
        data: {
          tagId,
          id: ulid(),
          name: extraName,
          isPrimary: false,
          events: {
            createMany: {
              data: [{ userId, type: TagNameEventType.CREATE, payload: {} }],
            },
          },
        },
      }),
    );

    const explicitParent = explicitParentId ? await prisma.tag.findUnique({ where: { id: explicitParentId } }) : null;
    if (explicitParentId && !explicitParent) return err({ type: "TAG_NOT_FOUND", id: explicitParentId });
    const $explicitParent = explicitParent
      ? prisma.tagParent.create({
          data: {
            id: ulid(),
            parentId: explicitParent.id,
            childId: tagId,
            isExplicit: true,
            events: {
              createMany: {
                data: [
                  { userId, type: TagParentEventType.CREATE, payload: {} },
                  { userId, type: TagParentEventType.SET_PRIMARY, payload: {} },
                ],
              },
            },
          },
        })
      : null;

    const implicitParents = await prisma.tag.findMany({ where: { id: { in: implicitParentIds } } });
    const missingImplicitParentid = implicitParentIds.find(
      (id) => !implicitParents.find((implicitParent) => implicitParent.id === id),
    );
    if (missingImplicitParentid) return err({ type: "TAG_NOT_FOUND", id: missingImplicitParentid });
    const $implicitParents = implicitParents.map(({ id: parentId }) =>
      prisma.tagParent.create({
        data: {
          id: ulid(),
          parentId,
          childId: tagId,
          isExplicit: false,
          events: {
            createMany: {
              data: [{ userId, type: TagParentEventType.CREATE, payload: {} }],
            },
          },
        },
      }),
    );

    const semitags = await prisma.semitag.findMany({ where: { id: { in: semitagIds } } });
    const missingSemitagId = semitagIds.find((id) => !semitags.find((semitag) => semitag.id === id));
    if (missingSemitagId) return err({ type: "SEMITAG_NOT_FOUND", id: missingSemitagId });
    const checkedSemitag = semitags.find((semitag) => semitag.isChecked);
    if (checkedSemitag) return err({ type: "SEMITAG_ALREADY_CHECKED", id: checkedSemitag.id });
    const $semitags = semitags.map((semitag) =>
      prisma.semitag.update({
        where: { id: semitag.id },
        data: {
          isChecked: true,
          events: { create: { userId, type: SemitagEventType.RESOLVE, payload: {} } },
          checking: {
            create: {
              id: ulid(),
              videoTag: {
                create: {
                  id: ulid(),
                  tag: { connect: { id: tagId } },
                  video: { connect: { id: semitag.videoId } },
                  events: { create: { userId, type: VideoTagEventType.ATTACH, payload: {} } },
                },
              },
            },
          },
        },
      }),
    );

    const [tag] = await prisma.$transaction([
      prisma.tag.create({
        data: {
          id: tagId,
          disabled: false,
          events: { create: { userId, type: TagEventType.REGISTER, payload: {} } },
        },
      }),
      $primaryName,
      ...$extraNames,
      ...($explicitParent ? [$explicitParent] : []),
      ...$implicitParents,
      ...$semitags,
    ]);
    return ok(tag);
  } catch (e) {
    return err({ type: "UNKNOWN", error: e });
  }
};

export const resolverRegisterTag = ({
  prisma,
  neo4j,
  logger,
  meilisearch,
}: Pick<ResolverDeps, "prisma" | "neo4j" | "logger" | "meilisearch">) =>
  (async (_: unknown, { input }, { currentUser: user }, info) => {
    const explicitParentId = input.explicitParent ? parseGqlID3("Tag", input.explicitParent) : ok(null);
    if (isErr(explicitParentId))
      return {
        __typename: "MutationInvalidTagIdError",
        tagId: explicitParentId.error.invalidId,
      } satisfies ResolversTypes["MutationInvalidTagIdError"];

    const implicitParentIds = parseGqlIDs3("Tag", input.implicitParents);
    if (isErr(implicitParentIds)) {
      switch (implicitParentIds.error.type) {
        case "DUPLICATED":
          return {
            __typename: "RegisterTagImplicitParentIdsDuplicatedError",
            tagId: implicitParentIds.error.duplicatedId,
          } satisfies ResolversTypes["RegisterTagImplicitParentIdsDuplicatedError"];
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidTagIdError",
            tagId: implicitParentIds.error.invalidId,
          } satisfies ResolversTypes["MutationInvalidTagIdError"];
      }
    }

    const resolveSemitags = parseGqlIDs3("Semitag", input.resolveSemitags);
    if (isErr(resolveSemitags)) {
      switch (resolveSemitags.error.type) {
        case "DUPLICATED":
          return {
            __typename: "RegisterTagResolveSemitagIdsDuplicatedError",
            semitagId: resolveSemitags.error.duplicatedId,
          } satisfies ResolversTypes["RegisterTagResolveSemitagIdsDuplicatedError"];
        case "INVALID_ID":
          return {
            __typename: "MutationInvalidSemitagIdError",
            semitagId: resolveSemitags.error.invalidId,
          } satisfies ResolversTypes["MutationInvalidSemitagIdError"];
      }
    }

    if (explicitParentId.data && implicitParentIds.data.includes(explicitParentId.data)) {
      return {
        __typename: "RegisterTagTagIdCollidedBetweenExplicitAndImplicitError",
        tagId: buildGqlId("Tag", explicitParentId.data),
      } satisfies ResolversTypes["RegisterTagTagIdCollidedBetweenExplicitAndImplicitError"];
    }

    const result = await register(prisma, {
      userId: user.id,
      primaryName: input.primaryName,
      extraNames: input.extraNames,
      explicitParentId: explicitParentId.data,
      implicitParentIds: implicitParentIds.data,
      semitagIds: resolveSemitags.data,
    });

    if (isErr(result)) {
      switch (result.error.type) {
        case "TAG_NOT_FOUND":
          return {
            __typename: "MutationTagNotFoundError",
            tagId: result.error.id,
          } satisfies ResolversTypes["MutationTagNotFoundError"];
        case "SEMITAG_NOT_FOUND":
          return {
            __typename: "MutationSemitagNotFoundError",
            semitagId: result.error.id,
          } satisfies ResolversTypes["MutationSemitagNotFoundError"];
        case "SEMITAG_ALREADY_CHECKED":
          return {
            __typename: "RegisterTagResolveSemitagAlreadyCheckedError",
            semitagId: result.error.id,
          } satisfies ResolversTypes["RegisterTagResolveSemitagAlreadyCheckedError"];
        case "UNKNOWN":
          logger.error({ error: result.error, path: info.path }, "Resolver unknown error");
          return {
            __typename: "RegisterTagOtherErrorsFallback",
            message: RegisterTagOtherErrorsFallbackMessage.Unknown,
          } satisfies ResolversTypes["RegisterTagOtherErrorsFallback"];
      }
    }

    const tag = result.data;
    const neo4jResult = await registerTagInNeo4j({ prisma, neo4j }, tag.id);
    if (isErr(neo4jResult)) {
      logger.error({ error: neo4jResult.error, path: info.path }, "Failed to update in neo4j");
    }

    const meilisearchResult = await addTagToMeiliSearch({ prisma, meilisearch }, tag.id);
    if (isErr(meilisearchResult)) {
      logger.error({ error: meilisearchResult.error, path: info.path }, "Failed to add in meilisearch");
    }

    return {
      __typename: "RegisterTagSucceededPayload",
      tag: new TagDTO(tag),
    } satisfies ResolversTypes["RegisterTagSucceededPayload"];
  }) satisfies MutationResolvers["registerTag"];
