import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";
import { QueryResolvers, User as GqlUser } from "../graphql/resolvers.js";
import { UserModel } from "../models/user.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";

export const user: QueryResolvers["user"] = async (_parent, { name }, _context, _info) => {
  const user = await dataSource.getRepository(User).findOne({ where: { name } });
  if (!user) throw new GraphQLError("Not Found");

  return new UserModel(user);
};

export const whoami: QueryResolvers["whoami"] = async (_parent, _args, { user }, _info) => {
  if (!user) throw new GraphQLError("Invalid access token!");

  return new UserModel(user);
};
