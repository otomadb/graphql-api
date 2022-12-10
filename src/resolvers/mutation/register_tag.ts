import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { TagName } from "../../db/entities/tag_names.js";
import { Tag } from "../../db/entities/tags.js";
import { TagModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { registerTag as registerTagInNeo4j } from "../../neo4j/register_tag.js";

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

export const registerTag =
  ({
    dataSource,
    neo4jDriver,
  }: {
    dataSource: DataSource;
    neo4jDriver: Neo4jDriver;
  }): MutationResolvers["registerTag"] =>
  async (_, { input }) => {
    const pairs = calcNameParentPair({
      primaryName: input.primaryName,
      extraNames: input.extraNames || [],
      explicitParent: input.explicitParent || null,
      implicitParents: input.implicitParents || [],
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
    tag.tagNames = [];
    tag.tagParents = [];

    const tagNames: TagName[] = [];

    const primaryTagName = new TagName();
    primaryTagName.id = ulid();
    primaryTagName.name = input.primaryName;
    primaryTagName.primary = true;
    primaryTagName.tag = tag;

    tagNames.push(primaryTagName);

    if (input.extraNames) {
      tagNames.push(
        ...input.extraNames.map((n) => {
          const tagName = new TagName();
          tagName.id = ulid();
          tagName.name = n;
          tagName.tag = tag;

          return tagName;
        })
      );
    }

    await dataSource.transaction(async (manager) => {
      await manager.getRepository(Tag).insert(tag);
      await manager.getRepository(TagName).insert(tagNames);
    });

    tag.tagNames = tagNames;

    await registerTagInNeo4j(neo4jDriver)(tag.id);

    return { tag: new TagModel(tag) };
  };
