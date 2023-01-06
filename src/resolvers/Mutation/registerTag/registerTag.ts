import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../../db/entities/semitags.js";
import { TagName } from "../../../db/entities/tag_names.js";
import { TagParent } from "../../../db/entities/tag_parents.js";
import { Tag } from "../../../db/entities/tags.js";
import { VideoTag } from "../../../db/entities/video_tags.js";
import { MutationResolvers } from "../../../graphql.js";
import { GraphQLNotFoundError, parseGqlID, parseGqlIDs } from "../../../utils/id.js";
import { TagModel } from "../../Tag/model.js";

export const registerTagInNeo4j = async (neo4jDriver: Neo4jDriver, rels: { videoId: string; tagId: string }[]) => {
  const session = neo4jDriver.session();
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

    const tagParents: TagParent[] = [];
    const semitagVideoTags: VideoTag[] = [];

    await dataSource.transaction(async (manager) => {
      const repoTag = manager.getRepository(Tag);
      const repoTagName = manager.getRepository(TagName);
      const repoTagParent = manager.getRepository(TagParent);
      const repoSemitag = manager.getRepository(Semitag);
      const repoVideoTag = manager.getRepository(VideoTag);

      await repoTag.insert(tag);

      if (!explicitParentId && implicitParentIds.length === 0) {
        for (const name of [primaryName, ...extraNames]) {
          const already = await repoTag.findOne({ where: { tagNames: { name } } });
          if (already) throw new GraphQLError(`"tag:${already.id}" is already registered for "${name}"`);
        }
      }

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
        tagParents.push(explicitTagParent);
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

        const implicitTagParent = new TagParent();
        implicitTagParent.id = ulid();
        implicitTagParent.explicit = false;
        implicitTagParent.parent = implicitParent;
        implicitTagParent.child = tag;
        tagParents.push(implicitTagParent);
      }

      for (const semitagId of semitagIds) {
        const semitag = await repoSemitag
          .findOneOrFail({
            where: { id: semitagId, resolved: false },
            relations: { video: true },
          })
          .catch(() => {
            throw GraphQLNotFoundError("semitag", semitagId);
          });

        await repoSemitag.update({ id: semitag.id }, { resolved: true, tag });

        const videoTag = new VideoTag();
        videoTag.id = ulid();
        videoTag.tag = tag;
        videoTag.video = semitag.video;

        semitagVideoTags.push(videoTag);
      }

      await repoTagName.insert([primaryTagName, ...extraTagNames]);
      await repoTagParent.insert(tagParents);
      await repoVideoTag.insert(semitagVideoTags);
    });

    await registerTagInNeo4j(
      neo4jDriver,
      semitagVideoTags.map(({ tag, video }) => ({ tagId: tag.id, videoId: video.id }))
    );

    return { tag: new TagModel(tag) };
  }) satisfies MutationResolvers["registerTag"];
