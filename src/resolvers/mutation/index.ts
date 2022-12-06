import { type Resolvers } from "../../graphql/resolvers.js";
import { registerTag } from "./register_tag.js";
import { registerVideo } from "./register_videos.js";
import { tagVideo } from "./tag_video.js";
import { untagVideo } from "./untag_video.js";

export const resolveMutation: Resolvers["Mutation"] = {
  registerTag,
  registerVideo,
  tagVideo,
  untagVideo,
};
