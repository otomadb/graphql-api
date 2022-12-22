import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Semitag } from "../../db/entities/semitags.js";
import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { tagVideo as tagVideoInNeo4j } from "../../neo4j/tag_video.js";
import { parseGqlID } from "../../utils/id.js";

export const resolveSemitag = ({ dataSource: ds, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_, { input: { id: semitagGqlId, tagId: tagGqlId } }) => {
    // TODO: auth

    const semitagRepo = ds.getRepository(Semitag);
    const tagRepo = ds.getRepository(Tag);
    const videoRepo = ds.getRepository(Video);

    const semitagId = parseGqlID("semitag", semitagGqlId);
    if (!semitagId) throw new GraphQLError(`"${semitagGqlId}" is invalid id for semitag`);

    const semitag = await semitagRepo.findOne({ where: { id: semitagId }, relations: { video: true } });
    if (!semitag) throw new GraphQLError(`No semitag found for "${semitagGqlId}"`);
    if (semitag.resolved) throw new GraphQLError(`semitag "${semitagGqlId}" was already resolved`);

    if (!tagGqlId) {
      semitag.resolved = true;
      await semitagRepo.update({ id: semitagId }, semitag);
      return { semitag };
    } else {
      const tagId = parseGqlID("tag", tagGqlId);
      if (!tagId) throw new GraphQLError(`"${tagGqlId}" is invalid id for tag`);
      const tag = await tagRepo.findOne({ where: { id: tagId } });
      if (!tag) throw new GraphQLError(`No tag found for "${tagGqlId}"`);

      semitag.resolved = true;
      semitag.tag = tag;
      await semitagRepo.update({ id: semitagId }, semitag);

      const videoTag = new VideoTag();
      videoTag.id = ulid();
      videoTag.video = semitag.video;
      videoTag.tag = tag;
      await videoRepo.insert(videoTag);
      await tagVideoInNeo4j(neo4jDriver)({ tagId: tag.id, videoId: semitag.video.id });

      return { semitag };
    }
  }) satisfies MutationResolvers["resovleSemitag"];
