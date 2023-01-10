import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../../db/entities/semitags.js";
import { Tag } from "../../../db/entities/tags.js";
import { VideoTag } from "../../../db/entities/video_tags.js";
import { MutationResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";

export const resolveSemitagInNeo4j = async (
  neo4jDriver: Neo4jDriver,
  { videoId, tagId }: { videoId: string; tagId: string }
) => {
  const session = neo4jDriver.session();
  try {
    await session.run(
      `
      MERGE (v:Video {id: $video_id})
      MERGE (t:Tag {id: $tag_id})
      MERGE r=(v)-[:TAGGED_BY]->(t)
      RETURN r
      `,
      { tag_id: tagId, video_id: videoId }
    );
  } finally {
    await session.close();
  }
};

export const resolveSemitag = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }) => {
    // TODO: auth

    const semitagId = parseGqlID("Semitag", semitagGqlId);
    const tagId = tagGqlId ? parseGqlID("Tag", tagGqlId) : null;

    const semitag = await dataSource
      .getRepository(Semitag)
      .findOne({ where: { id: semitagId }, relations: { video: true } });

    if (!semitag) throw new GraphQLNotExistsInDBError("Semitag", semitagId);
    if (semitag.resolved) throw new GraphQLError(`"semitag:${semitagId}" was already resolved`);

    if (!tagId) {
      await dataSource.getRepository(Semitag).update({ id: semitag.id }, { resolved: true, tag: null });

      return { semitag };
    } else {
      const videoTag = new VideoTag();
      videoTag.id = ulid();
      videoTag.video = semitag.video;

      await dataSource.transaction(async (manager) => {
        const tagRepo = manager.getRepository(Tag);
        const repoSemitag = manager.getRepository(Semitag);
        const videoTagRepo = manager.getRepository(VideoTag);

        const tag = await tagRepo.findOne({ where: { id: tagId } });
        if (!tag) throw new GraphQLNotExistsInDBError("Tag", tagId);

        await repoSemitag.update({ id: semitag.id }, { resolved: true, tag });

        videoTag.tag = tag;
        await videoTagRepo.insert(videoTag);
      });

      await resolveSemitagInNeo4j(neo4jDriver, {
        tagId: videoTag.tag.id,
        videoId: videoTag.video.id,
      });

      return { semitag };
    }
  }) satisfies MutationResolvers["resovleSemitag"];
