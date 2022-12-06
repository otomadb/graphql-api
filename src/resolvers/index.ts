import { type Resolvers } from "~/codegen/resolvers.js";

import { mutation } from "./mutation/index.js";
import { queryResolvers } from "./query/index.js";

export const resolvers: Resolvers = {
  Query: queryResolvers,
  Mutation: mutation,
};
