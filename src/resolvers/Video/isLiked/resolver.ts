import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { VideoResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { findLike } from "../like/findLike.js";

export const resolveVideoIsLiked = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, _args, { currentUser }, info) => {
    const like = await findLike(prisma, { videoId, holderId: currentUser.id });
    if (isErr(like)) {
      switch (like.error.type) {
        case "UNKNOWN_ERROR":
          logger.error({ error: like.error.error, currentUser, path: info.path }, "Internal server error");
          throw new GraphQLError("Internal server error");
      }
    }
    if (!like.data) return false;
    return !like.data.isRemoved;
  }) satisfies VideoResolvers["isLiked"];
