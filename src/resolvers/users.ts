import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";
import { QueryResolvers } from "../graphql/resolvers.js";

export const user: QueryResolvers["user"] = async (_parent, { name }, _context, _info) => {
  const user = await dataSource.getRepository(User).findOne({ where: { name } });
  if (!user) throw new GraphQLError("Not Found");

  return user;
};

export const whoami: QueryResolvers["whoami"] = async (_parent, _args, { user }, _info) => {
  if (!user) throw new GraphQLError("Invalid access token!");
  return user;
};
