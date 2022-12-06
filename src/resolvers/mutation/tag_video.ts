import { GraphQLError } from "graphql";
import { ulid } from "ulid";

import { MutationResolvers } from "~/codegen/resolvers.js";
import { dataSource } from "~/db/data-source.js";
import { Tag } from "~/db/entities/tags.js";
import { VideoTag } from "~/db/entities/video_tags.js";
import { Video } from "~/db/entities/videos.js";
import { TagModel } from "~/models/tag.js";
import { UserModel } from "~/models/user.js";
import { VideoModel } from "~/models/video.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "~/utils/id.js";

export const tagVideo: MutationResolvers["tagVideo"] = async (
  _parent,
  { input: { tagId, videoId } },
  { user },
  _info
) => {
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

  return {
    createdAt: new Date(),
    id: addIDPrefix(ObjectType.VideoTag, videoTag.id),
    tag: new TagModel(tag),
    user: new UserModel(user),
    video: new VideoModel(video),
  };
};
