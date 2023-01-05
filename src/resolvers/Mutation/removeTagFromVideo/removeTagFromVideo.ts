import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver } from "neo4j-driver";
import { DataSource } from "typeorm";

import { VideoTag } from "../../../db/entities/video_tags.js";
import { MutationResolvers } from "../../../graphql.js";
import { removeVideoTag as removeVideoTagInNeo4j } from "../../../neo4j/removeVideoTag.js";
import { parseGqlID } from "../../../utils/id.js";
import { TagModel } from "../../Tag/model.js";
import { VideoModel } from "../../Video/model.js";

export const removeTagFromVideo = ({ dataSource, neo4jDriver }: { dataSource: DataSource; neo4jDriver: Neo4jDriver }) =>
  (async (_parent, { input: { tagId: tagGqlId, videoId: videoGqlId } }, { user }) => {
    if (!user) throw new GraphQLError("required to sign in");

    const videoId = parseGqlID("video", videoGqlId);
    const tagId = parseGqlID("tag", tagGqlId);

    const repoVideoTag = dataSource.getRepository(VideoTag);

    const tagging = await repoVideoTag.findOne({
      where: { video: { id: videoId }, tag: { id: tagId } },
      relations: { tag: true, video: true },
    });
    if (!tagging) throw new GraphQLError(`"tag:${tagId}" is not tagged to "video:${videoId}"`);

    await repoVideoTag.remove(tagging);

    await removeVideoTagInNeo4j({ neo4jDriver })(tagging);

    return {
      video: new VideoModel(tagging.video),
      tag: new TagModel(tagging.tag),
    };
  }) satisfies MutationResolvers["removeTagFromVideo"];
