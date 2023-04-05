import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { UserResolvers } from "../../graphql.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";
import { get } from "./prisma.js";

export const resolverUserLikes = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async ({ id: userId }, _args, { currentUser }, info) => {
    const result = await get(prisma, { holderId: userId, currentUserId: currentUser?.id || null });

    if (isErr(result))
      switch (result.error.type) {
        case "INTERNAL_SERVER_ERROR":
          logger.error(
            {
              path: info.path,
              error: result.error.error,
              holderId: result.error.holderId,
              currentUserId: result.error.currentUserId,
            },
            "Internal server error"
          );
          throw new GraphQLError("Internal server error");
        case "PRIVATE_MYLIST_NOT_AUTH":
          logger.warn({ path: info.path, mylistId: result.error.mylistId }, "Not authenticated");
          return null;
        case "PRIVATE_MYLIST_WRONG_HOLDER":
          logger.warn(
            { path: info.path, mylistId: result.error.mylistId, currentUserId: result.error.currentUserId },
            "Wrong holder"
          );
          return null;
      }

    return MylistModel.fromPrisma(result.data);
  }) satisfies UserResolvers["likes"];
