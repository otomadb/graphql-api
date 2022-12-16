import { UserModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const whoami =
  (): QueryResolvers["whoami"] =>
  async (_parent, _args, { user }) => {
    if (!user) return null;
    return new UserModel(user);
  };
