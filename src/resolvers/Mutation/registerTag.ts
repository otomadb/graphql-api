import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../db/entities/semitags.js";
import { TagName } from "../../db/entities/tag_names.js";
import { TagParent } from "../../db/entities/tag_parents.js";
import { Tag } from "../../db/entities/tags.js";
import { MutationResolvers } from "../../graphql.js";
import { registerTag as registerTagInNeo4j } from "../../neo4j/register_tag.js";
import { GraphQLNotFoundError, parseGqlID, parseGqlIDs } from "../../utils/id.js";
import { TagModel } from "../Tag/model.js";

export const registerTag = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input }) => {
    const { primaryName, extraNames, meaningless } = input;

    if (input.explicitParent && input.implicitParents.includes(input.explicitParent))
      throw new GraphQLError(`"${input.explicitParent}" is specified as explicitParent and also implicitParents`);

    const duplicatedImplicitParentGqlId = input.implicitParents.find((id, i, arr) => arr.indexOf(id) !== i);
    if (duplicatedImplicitParentGqlId)
      throw new GraphQLError(`"${duplicatedImplicitParentGqlId}" is duplicated in implicitParents`);

    const explicitParentId = input.explicitParent ? parseGqlID("tag", input.explicitParent) : null;
    const implicitParentIds = parseGqlIDs("tag", input.implicitParents);

    const semitagIds = parseGqlIDs("semitag", input.resolveSemitags);

    const tag = new Tag();
    tag.id = ulid();
    tag.meaningless = meaningless;

    const primaryTagName = new TagName();
    primaryTagName.id = ulid();
    primaryTagName.name = primaryName;
    primaryTagName.primary = true;
    primaryTagName.tag = tag;

    const extraTagNames = extraNames.map((extraName) => {
      const extraTagName = new TagName();
      extraTagName.id = ulid();
      extraTagName.name = extraName;
      extraTagName.primary = false;
      extraTagName.tag = tag;
      return extraTagName;
    });

    await dataSource.transaction(async (manager) => {
      const repoTag = manager.getRepository(Tag);
      const repoTagName = manager.getRepository(TagName);
      const repoTagParent = manager.getRepository(TagParent);
      const repoSemitag = manager.getRepository(Semitag);

      await repoTag.insert(tag);

      if (!explicitParentId && implicitParentIds.length === 0) {
        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({ where: { tagNames: { name } } });
          if (already) throw new GraphQLError(`"tag:${already.id}" is already registered for "${name}"`);
        }
      }

      await repoTagName.insert([primaryTagName, ...extraTagNames]);

      if (explicitParentId) {
        const explicitParent = await repoTag.findOne({ where: { id: explicitParentId } });
        if (!explicitParent) throw GraphQLNotFoundError("tag", explicitParentId);

        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({
            where: {
              tagNames: { name },
              tagParents: { parent: { id: explicitParentId } },
            },
          });
          if (already)
            throw new GraphQLError(
              `"tag:${already.id}" is already registered for "${name}" with parent "tag:${explicitParentId}"`
            );
        }

        const explicitTagParent = new TagParent();
        explicitTagParent.id = ulid();
        explicitTagParent.explicit = true;
        explicitTagParent.parent = explicitParent;
        explicitTagParent.child = tag;
        await repoTagParent.insert(explicitTagParent);
      }

      for (const implicitParentId of implicitParentIds) {
        const implicitParent = await repoTag.findOne({ where: { id: implicitParentId } });
        if (!implicitParent) throw GraphQLNotFoundError("tag", implicitParentId);

        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({
            where: {
              tagNames: { name },
              tagParents: { parent: { id: implicitParentId } },
            },
          });
          if (already)
            throw new GraphQLError(
              `"tag:${already.id}" is already registered for "${name}" with parent "tag:${implicitParentId}"`
            );
        }

        const explicitTagParent = new TagParent();
        explicitTagParent.id = ulid();
        explicitTagParent.explicit = false;
        explicitTagParent.parent = implicitParent;
        explicitTagParent.child = tag;
        await repoTagParent.insert(explicitTagParent);
      }

      for (const semitagId of semitagIds) {
        const semitag = await repoSemitag.findOne({ where: { id: semitagId, resolved: false } });
        if (!semitag) throw GraphQLNotFoundError("semitag", semitagId);
        await repoSemitag.update({ id: semitag.id }, { resolved: true, tag });
      }
    });

    await registerTagInNeo4j(neo4jDriver)(tag.id);
    return { tag: new TagModel(tag) };
  }) satisfies MutationResolvers["registerTag"];
