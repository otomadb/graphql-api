import { type Resolvers } from "../graphql/resolvers.js";
import { getTag } from "./get_tag.js";
import { getTags } from "./get_tags.js";
import { getUser } from "./get_user.js";
import { getVideo } from "./get_video.js";
import { getVideos } from "./get_videos.js";
import { registerTag } from "./register_tag.js";
import { registerVideo } from "./register_videos.js";
import { searchTags } from "./search_tags.js";
import { searchVideos } from "./search_videos.js";
import { tagVideo } from "./tag_video.js";
import { untagVideo } from "./untag_video.js";
import { whoami } from "./whoami.js";

export const resolvers: Resolvers = {
  Query: {
    // findNiconicoSource,　// 最悪まだ実装しなくてもいい
    // niconicoSource,　// 最悪まだ実装しなくてもいい
    searchTags: searchTags,
    searchVideos: searchVideos,
    tag: getTag,
    tags: getTags,
    user: getUser,
    video: getVideo,
    videos: getVideos,
    whoami: whoami,
  },
  Mutation: {
    registerTag: registerTag,
    registerVideo: registerVideo,
    tagVideo: tagVideo,
    untagVideo: untagVideo,
  },
};
