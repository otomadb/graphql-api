import { GraphQLError } from "graphql";

import { UserModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const whoami =
  (): QueryResolvers["whoami"] =>
  async (_parent, _args, { user }) => {
    if (!user) throw new GraphQLError("Invalid access token!");

    return new UserModel(user);
  };
