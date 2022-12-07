import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { User } from "../../db/entities/users.js";
import { UserModel } from "../../graphql/models.js";
import { QueryResolvers } from "../../graphql/resolvers.js";

export const getUser =
  ({ ds }: { ds: DataSource }): QueryResolvers["user"] =>
  async (_parent, { name }) => {
    const user = await ds.getRepository(User).findOne({ where: { name } });
    if (!user) throw new GraphQLError("Not Found");

    return new UserModel(user);
  };
