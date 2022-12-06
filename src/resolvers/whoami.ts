import { GraphQLError } from "graphql";

import { QueryResolvers } from "../graphql/resolvers.js";
import { UserModel } from "../models/user.js";

export const whoami: QueryResolvers["whoami"] = async (_parent, _args, { user }, _info) => {
  if (!user) throw new GraphQLError("Invalid access token!");

  return new UserModel(user);
};
