import { type Resolvers } from "../graphql/resolvers.js";
import { user, whoami } from "./users.js";

export const resolvers: Resolvers = {
  Query: {
    user,
    whoami,
  },
};
