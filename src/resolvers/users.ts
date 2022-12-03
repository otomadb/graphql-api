import { GraphQLError } from "graphql";
import { dataSource } from "../db/data-source.js";
import { User } from "../db/entities/users.js";
import { QueryResolvers } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";

export function userEntityToGraphQLType(user: User) {
  return {
    id: addIDPrefix(ObjectType.User, user.id),
    name: user.name,
    displayName: user.name,
    icon: user.icon,
  };
}

export const user: QueryResolvers["user"] = async (_parent, { name }, _context, _info) => {
  const user = await dataSource.getRepository(User).findOne({ where: { name } });
  if (!user) throw new GraphQLError("Not Found");

  return userEntityToGraphQLType(user);
};

export const whoami: QueryResolvers["whoami"] = async (_parent, _args, { user }, _info) => {
  if (!user) throw new GraphQLError("Invalid access token!");

  return userEntityToGraphQLType(user);
};
