import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { VideoResolvers } from "../../graphql.js";
import { MylistRegistrationModel } from "../../MylistRegistration/model.js";
import { ResolverDeps } from "../../types.js";
import { findLike } from "./findLike.js";

export const resolveVideoLike = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: videoId }, _args, { currentUser }, info) => {
    const like = await findLike(prisma, { videoId, holderId: currentUser.id });
    if (isErr(like)) {
      switch (like.error.type) {
        case "UNKNOWN_ERROR":
          logger.error({ error: like.error.error, currentUser, path: info.path }, "Internal server error");
          throw new GraphQLError("Internal server error");
      }
    }
    return MylistRegistrationModel.fromPrismaNullable(like.data);
  }) satisfies VideoResolvers["like"];
