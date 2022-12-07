import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { VideoTag } from "../../db/entities/video_tags.js";
import { TagModel, UserModel, VideoModel } from "../../graphql/models.js";
import { MutationResolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../../utils/id.js";

export const untagVideo =
  ({ ds }: { ds: DataSource }): MutationResolvers["untagVideo"] =>
  async (_parent, { input: { tagId, videoId } }, { user }) => {
    if (!user) {
      throw new GraphQLError("required to sign in");
    }

    const repository = ds.getRepository(VideoTag);

    const videoTag = await repository.findOne({
      relations: {
        tag: true,
        video: true,
      },
      where: {
        video: { id: removeIDPrefix(ObjectType.Video, videoId) },
        tag: { id: removeIDPrefix(ObjectType.Tag, tagId) },
      },
    });
    if (!videoTag) {
      throw new GraphQLError("Not Found");
    }

    await repository.remove(videoTag);

    return {
      createdAt: new Date(),
      id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
      tag: new TagModel(videoTag.tag),
      user: new UserModel(user),
      video: new VideoModel(videoTag.video),
    };
  };
