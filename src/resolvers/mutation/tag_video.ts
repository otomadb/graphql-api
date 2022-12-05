import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { ulid } from "ulid";

import { Tag } from "../../db/entities/tags.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { Video } from "../../db/entities/videos.js";
import { TagModel, UserModel, VideoModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { tagVideo as tagVideoInNeo4j } from "../../neo4j/tag_video.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../../utils/id.js";

export const tagVideo =
  ({ dataSource }: { dataSource: DataSource }): MutationResolvers["tagVideo"] =>
  async (_parent, { input: { tagId, videoId } }, { user }) => {
    if (!user) {
      throw new GraphQLError("required to sign in");
    }

    const video = await dataSource.getRepository(Video).findOne({
      where: { id: removeIDPrefix(ObjectType.Video, videoId) },
    });
    if (video === null) throw new GraphQLError("Video Not Found");
    const tag = await dataSource.getRepository(Tag).findOne({
      where: { id: removeIDPrefix(ObjectType.Tag, tagId) },
    });
    if (tag === null) throw new GraphQLError("Tag Not Found");
    const videoTag = new VideoTag();
    videoTag.id = ulid();
    videoTag.video = video;
    videoTag.tag = tag;
    await dataSource.getRepository(VideoTag).insert(videoTag);

    await tagVideoInNeo4j({ tagId: tag.id, videoId: video.id });

    return {
      createdAt: new Date(),
      id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
      tag: new TagModel(tag),
      user: new UserModel(user),
      video: new VideoModel(video),
    };
  };
