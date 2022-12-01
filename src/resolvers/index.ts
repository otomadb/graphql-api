import { type Resolvers } from "../graphql/resolvers.js";
import { user, whoami } from "./users.js";
import { registerVideo, video, videos } from "./videos.js";

export const resolvers: Resolvers = {
  Query: {
    user,
    video,
    videos,
    whoami,
  },
  Mutation: {
    registerVideo,
  },
};
