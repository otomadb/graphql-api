import { GraphQLError } from "graphql";

import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkViewerResolver: MkQueryResolver<"viewer", "userService"> =
  ({ userService }) =>
  async (_parent, _args, { currentUser }) => {
    if (!currentUser) return null;
    try {
      return userService.getById(currentUser.id);
    } catch (e) {
      throw new GraphQLError("Internal server error");
    }
  };
