import { type Resolvers } from "../graphql/resolvers.js";
import { user, whoami } from "./users.js";
import { registerVideo } from "./videos.js";

export const resolvers: Resolvers = {
  Query: {
    user,
    whoami,
  },
  Mutation: {
    registerVideo,
  },
};
