import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { User } from "../../db/entities/users.js";
import { QueryResolvers } from "../../graphql/resolvers.js";
import { UserModel } from "../user/model.js";

export const getUser =
  ({ dataSource }: { dataSource: DataSource }): QueryResolvers["user"] =>
  async (_parent, { name }) => {
    const user = await dataSource.getRepository(User).findOne({ where: { name } });
    if (!user) throw new GraphQLError("Not Found");

    return new UserModel(user);
  };
