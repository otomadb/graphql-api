import { GraphQLError } from "graphql";

import { UserModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { dataSource } from "../../db/data-source.js";
import { User } from "../../db/entities/users.js";

export const getUser: QueryResolvers["user"] = async (_parent, { name }) => {
  const user = await dataSource.getRepository(User).findOne({ where: { name } });
  if (!user) throw new GraphQLError("Not Found");

  return new UserModel(user);
};
