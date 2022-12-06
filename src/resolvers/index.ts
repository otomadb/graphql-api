import { type Resolvers } from "~/codegen/resolvers.js";

import { resolveMutation } from "./mutation/index.js";
import { resolveQuery } from "./query/index.js";
import { resolveTag } from "./tags/index.js";
import { resolveVideo } from "./video/index.js";

export const resolvers: Resolvers = {
  Query: resolveQuery,
  Mutation: resolveMutation,
  Tag: resolveTag,
  Video: resolveVideo,
};
