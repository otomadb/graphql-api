import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Tag } from "../../../db/entities/tags.js";
import { VideoTag } from "../../../db/entities/video_tags.js";
import { Video } from "../../../db/entities/videos.js";
import { MutationResolvers } from "../../../graphql.js";
import { GraphQLNotFoundError, parseGqlID } from "../../../utils/id.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";

export const addTagToVideoInNeo4j = async (
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

export const addTagToVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID("video", videoGqlId);
    const tagId = parseGqlID("tag", tagGqlId);

    const videoTag = new VideoTag();
    videoTag.id = ulid();

    await dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const repoTag = manager.getRepository(Tag);
      const repoVideoTag = manager.getRepository(VideoTag);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw GraphQLNotFoundError("video", videoId);

      const tag = await repoTag.findOne({ where: { id: tagId } });
      if (!tag) throw GraphQLNotFoundError("tag", tagId);

      videoTag.video = video;
      videoTag.tag = tag;
      await repoVideoTag.insert(videoTag);
    });

    await addTagToVideoInNeo4j(neo4jDriver, {
      tagId: videoTag.tag.id,
      videoId: videoTag.video.id,
    });

    return {
      video: new VideoModel(videoTag.video),
      tag: new TagModel(videoTag.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
