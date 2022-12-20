import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { User } from "../../db/entities/users.js";
import { QueryResolvers } from "../../graphql.js";
import { UserModel } from "../User/model.js";

export const findUser = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { input: { name } }) => {
    if (!name) throw new GraphQLError("name must be provided"); // TODO: error messsage

    const user = await dataSource.getRepository(User).findOne({ where: { name } });
    if (!user) throw new GraphQLError("Not Found");

    return new UserModel(user);
  }) satisfies QueryResolvers["findUser"];
