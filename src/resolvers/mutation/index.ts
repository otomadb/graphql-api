import { DataSource } from "typeorm";

import { type Resolvers } from "../../graphql/resolvers.js";
import { addVideoToMylist } from "./add_video_to_mylist.js";
import { createMylist } from "./create_mylist.js";
import { likeVideo } from "./like_video.js";
import { registerTag } from "./register_tag.js";
import { registerVideo } from "./register_videos.js";
import { tagVideo } from "./tag_video.js";
import { untagVideo } from "./untag_video.js";

export const resolveMutation = (deps: { dataSource: DataSource }): Resolvers["Mutation"] => ({
  registerTag: registerTag(deps),
  registerVideo: registerVideo(deps),
  tagVideo: tagVideo(deps),
  untagVideo: untagVideo(deps),
  addVideoToMylist: addVideoToMylist(deps),
  createMylist: createMylist(deps),
  likeVideo: likeVideo(deps),
});
