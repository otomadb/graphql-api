import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { Tag } from "../../db/entities/tags.js";
import { TagModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { registerTag as registerTagInNeo4j } from "../../neo4j/register_tag.js";
import { parseGqlID } from "../../utils/id.js";

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
}) => {
  const names = [primaryName, ...extraNames];
  const parents = [explicitParent, ...implicitParents];

  return names
    .map((n) => parents.map((p) => ({ name: n, parent: p })))
    .reduce((p, c) => [...p, ...c], [] as { name: string; parent: string | null }[]);
};

export const mkExplicitTag = (childId: string, parentId: string | null) => {
  if (!parentId) return null;

  const parent = new TagParent();
  parent.id = ulid();
  parent.parent = { id: parentId } as Tag;
  parent.child = { id: childId } as Tag;
  parent.explicit = true;

  return parent;
};

export const registerTag =
  ({
    dataSource,
    neo4jDriver,
  }: {
    dataSource: DataSource;
    neo4jDriver: Neo4jDriver;
  }): MutationResolvers["registerTag"] =>
  async (
    _,
    { input: { primaryName, extraNames, explicitParent: explicitParentRawId, implicitParents: implicitParentsRawIds } }
  ) => {
    const explicitParentId = explicitParentRawId ? parseGqlID("tag", explicitParentRawId) : null;
    if (explicitParentRawId && !explicitParentId)
      throw new GraphQLError(`"${explicitParentRawId}" is invalid for tag id`);

    const implicitParentIds: string[] = [];
    for (const implicitParentsRawId of implicitParentsRawIds || []) {
      const parsed = parseGqlID("tag", implicitParentsRawId);
      if (!parsed) throw new GraphQLError(`"${explicitParentRawId}" is invalid for tag id`);
      implicitParentIds.push(parsed);
    }

    /* parent check */
    for (const parentId of [...(explicitParentId ? [explicitParentId] : []), ...implicitParentIds]) {
      const exists = await dataSource
        .getRepository(Tag)
        .findOne({ where: { id: parentId } })
        .then((t) => !!t);
      if (exists) continue;
      throw new GraphQLError(`"tag:${parentId}" is specified as parent but not exists`);
    }

    /* name check */
    const pairs = calcNameParentPair({
      primaryName,
      extraNames: extraNames || [],
      explicitParent: explicitParentId,
      implicitParents: implicitParentIds,
    });
    for (const pair of pairs) {
      const already = await dataSource.getRepository(Tag).findOne({
        where: pair.parent
          ? { tagNames: { name: pair.name }, tagParents: { id: pair.parent } }
          : { tagNames: { name: pair.name } },
      });
      if (!already) continue;
      throw new GraphQLError(
        [
          `"${pair.name}"${pair.parent ? ` with parent "tag:${pair.parent}"` : ""}`,
          `is already registered in "tag:${already.id}"`,
        ].join(" ")
      );
    }

    const tag = new Tag();
    tag.id = ulid();
    tag.videoTags = [];

    const tagNames: TagName[] = [];

    const primaryTagName = new TagName();
    primaryTagName.id = ulid();
    primaryTagName.name = primaryName;
    primaryTagName.primary = true;
    primaryTagName.tag = tag;

    tagNames.push(primaryTagName);

    if (extraNames) {
      tagNames.push(
        ...extraNames.map((n) => {
          const tagName = new TagName();
          tagName.id = ulid();
          tagName.name = n;
          tagName.tag = tag;

          return tagName;
        })
      );
    }

    const explicitTagParent = mkExplicitTag(tag.id, explicitParentId);

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(tag);
      await manager.getRepository(TagName).insert(tagNames);
      await manager.getRepository(TagParent).insert([...(explicitTagParent ? [explicitTagParent] : [])]);
    });

    await registerTagInNeo4j(neo4jDriver)(tag.id);

    return { tag: new TagModel(tag) };
  };
