import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { Video } from "../../db/entities/videos.js";
import { MutationResolvers } from "../../graphql.js";
import { addVideoTag as addVideoTagInNeo4j } from "../../neo4j/addVideoTag.js";
import { GraphQLNotFoundError, parseGqlID } from "../../utils/id.js";
import { TagModel } from "../Tag/model.js";
import { VideoModel } from "../Video/model.js";

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

    await addVideoTagInNeo4j({ neo4jDriver })(videoTag);

    return {
      video: new VideoModel(videoTag.video),
      tag: new TagModel(videoTag.tag),
    };
  }) satisfies MutationResolvers["addTagToVideo"];
