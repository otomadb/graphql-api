import { type Resolvers } from "../graphql/resolvers.js";
import { tag } from "./tags.js";
import { user, whoami } from "./users.js";
import { registerVideo, video, videos } from "./videos.js";

export const resolvers: Resolvers = {
  Query: {
    // findNiconicoSource,　// 最悪まだ実装しなくてもいい
    // niconicoSource,　// 最悪まだ実装しなくてもいい
    // searchTags,
    // searchVideos,
    tag,
    user,
    video,
    videos,
    whoami,
  },
  Mutation: {
    // registerTag, // 最悪まだ実装しなくてもいい
    registerVideo,
    // tagVideo,
    // untagVideo,
  },
};
