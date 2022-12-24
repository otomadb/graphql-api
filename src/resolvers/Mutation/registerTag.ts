import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource, EntityManager } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../db/entities/semitags.js";
import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { MutationResolvers } from "../../graphql.js";
import { registerTag as registerTagInNeo4j } from "../../neo4j/register_tag.js";
import { parseGqlID, parseGqlIDs } from "../../utils/id.js";
import { TagModel } from "../Tag/model.js";

export const calcNameParentPair = ({
  primaryName,
  extraNames,
  explicitParent,
  implicitParents,
}: {
  primaryName: string;
  extraNames: string[];
  explicitParent: string | null;
  implicitParents: string[];
}): ({ name: string; parent: string } | { name: string; parent: null })[] => {
  const names = [primaryName, ...extraNames];
  const parents =
    explicitParent === null
      ? implicitParents.length === 0
        ? [null]
        : implicitParents
      : [explicitParent, ...implicitParents];

  return names
    .map((n) => parents.map((p) => ({ name: n, parent: p })))
    .reduce((p, c) => [...p, ...c], [] as { name: string; parent: string | null }[]);
};

export const getSemitags = (manager: EntityManager) => async (ids: string[]) =>
  Promise.all(
    ids.map(async (id) => {
      try {
        return manager
          .getRepository(Semitag)
          .findOneOrFail({ where: { id, resolved: false }, relations: { video: true } });
      } catch {
        throw id;
      }
    })
  );

export const resolveSemitags = (manager: EntityManager) => async (semitags: Semitag[], tag: Tag) =>
  Promise.all(semitags.map((semitag) => resolveSemitag(manager)(semitag, tag)));

export const resolveSemitag = (manager: EntityManager) => async (semitag: Semitag, tag: Tag) => {
  await manager.getRepository(Semitag).update({ id: semitag.id }, { resolved: true, tag });

  const videoTag = new VideoTag();
  videoTag.id = ulid();
  videoTag.tag = tag;
  videoTag.video = semitag.video;
  await manager.getRepository(VideoTag).insert(videoTag);
};

export const registerTag = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (
    _,
    {
      input: {
        primaryName,
        extraNames: extraNamesRaw,
        explicitParent: explicitParentRawId,
        implicitParents: implicitParentsRawIds,
        meaningless, // TODO: default value
        resolveSemitags: resolveSemitagIds,
      },
    }
  ) => {
    const extraNames = extraNamesRaw;

    const explicitParentId = explicitParentRawId ? parseGqlID("tag", explicitParentRawId) : null;
    if (explicitParentRawId && !explicitParentId)
      throw new GraphQLError(`"${explicitParentRawId}" is invalid for tag id`);

    const implicitParentIds: string[] = [];
    for (const implicitParentsRawId of implicitParentsRawIds) {
      const parsed = parseGqlID("tag", implicitParentsRawId);
      if (!parsed) throw new GraphQLError(`"${explicitParentRawId}" is invalid for tag id`);
      if (explicitParentId === parsed)
        throw new GraphQLError(`"tag:${parsed}" is specified as explicitParent and also included in implicitParents`);
      if (implicitParentIds.includes(parsed))
        throw new GraphQLError(`"tag:${parsed}" is included in implicitParents multiple times`);
      implicitParentIds.push(parsed);
    }

    const semitagIds = parseGqlIDs("semitag", resolveSemitagIds);

    /* name check */
    const pairs = calcNameParentPair({
      primaryName,
      extraNames,
      explicitParent: explicitParentId,
      implicitParents: implicitParentIds,
    });
    for (const pair of pairs) {
      const already = await dataSource.getRepository(Tag).findOne({
        where: pair.parent
          ? { tagNames: { name: pair.name }, tagParents: { parent: { id: pair.parent } } }
          : { tagNames: { name: pair.name } },
      });
      if (!already) continue;
      if (pair.parent)
        throw new GraphQLError(
          `name "${pair.name}" with parent "tag:${pair.parent}" is already registered in "tag:${already.id}"`
        );
      else throw new GraphQLError(`name "${pair.name}" is reserved in "tag:${already.id}"`);
    }

    const tag = new Tag();
    tag.id = ulid();
    tag.videoTags = [];
    tag.meaningless = meaningless;
    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(tag);

      {
        const nameRel = new TagName();
        nameRel.id = ulid();
        nameRel.name = primaryName;
        nameRel.primary = true;
        nameRel.tag = tag;
        await manager.getRepository(TagName).insert(nameRel);
      }

      for (const extraName of extraNames) {
        const nameRel = new TagName();
        nameRel.id = ulid();
        nameRel.name = extraName;
        nameRel.primary = false;
        nameRel.tag = tag;
        await manager.getRepository(TagName).insert(nameRel);
      }

      if (explicitParentId) {
        const parentRel = new TagParent();
        parentRel.id = ulid();

        parentRel.child = tag;

        const parentTag = await dataSource.getRepository(Tag).findOne({ where: { id: explicitParentId } });
        if (!parentTag) throw new GraphQLError(`"tag:${explicitParentId}" is specified as parent but not exists`);
        parentRel.parent = parentTag;

        parentRel.explicit = true;

        await manager.getRepository(TagParent).insert(parentRel);
      }

      for (const implicitParentId of implicitParentIds) {
        const parentRel = new TagParent();
        parentRel.id = ulid();

        parentRel.child = tag;

        const parentTag = await dataSource.getRepository(Tag).findOne({ where: { id: implicitParentId } });
        if (!parentTag) throw new GraphQLError(`"tag:${implicitParentId}" is specified as parent but not exists`);
        parentRel.parent = parentTag;

        parentRel.explicit = false;

        await manager.getRepository(TagParent).insert(parentRel);
      }

      const semitags = await getSemitags(manager)(semitagIds).catch((id: string) => {
        throw new GraphQLError(`No "semitag" found for "semitag:${id}"`);
      });
      await resolveSemitags(manager)(semitags, tag).catch(() => {
        throw new GraphQLError("Something happens");
      });
    });

    await registerTagInNeo4j(neo4jDriver)(tag.id);

    return { tag: new TagModel(tag) };
  }) satisfies MutationResolvers["registerTag"];
