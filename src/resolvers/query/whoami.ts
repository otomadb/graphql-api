import { QueryResolvers } from "../../graphql/resolvers.js";
import { UserModel } from "../user/model.js";

export const whoami =
  (): QueryResolvers["whoami"] =>
  async (_parent, _args, { user }) => {
    if (!user) return null;
    return new UserModel(user);
  };
