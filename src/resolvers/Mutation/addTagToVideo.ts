import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { tagVideo as tagVideoInNeo4j } from "../../neo4j/tag_video.js";
import { GraphQLNotFoundError, parseGqlID2 } from "../../utils/id.js";
import { TagModel } from "../Tag/model.js";
import { VideoModel } from "../Video/model.js";

export const addTagToVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID2("video", videoGqlId);
    const tagId = parseGqlID2("tag", tagGqlId);

    const videoTag = new VideoTag();
    videoTag.id = ulid();

    dataSource.transaction(async (manager) => {
      const repoVideo = manager.getRepository(Video);
      const tagRepo = manager.getRepository(Tag);
      const repoVideoTag = manager.getRepository(VideoTag);

      const video = await repoVideo.findOne({ where: { id: videoId } });
      if (!video) throw GraphQLNotFoundError("video", videoGqlId);

      const tag = await tagRepo.findOne({ where: { id: tagId } });
      if (!tag) throw GraphQLNotFoundError("tag", tagGqlId);

      videoTag.video = video;
      videoTag.tag = tag;
      await repoVideoTag.insert(videoTag);
    });

    await tagVideoInNeo4j(neo4jDriver)({
      tagId: videoTag.tag.id,
      videoId: videoTag.video.id,
    });

    return {
      video: new VideoModel(videoTag.video),
      tag: new TagModel(videoTag.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
