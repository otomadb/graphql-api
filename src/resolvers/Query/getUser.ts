import { DataSource } from "typeorm";

import { User } from "../../db/entities/users.js";
import { QueryResolvers } from "../../graphql.js";
import { GraphQLNotFoundError, parseGqlID } from "../../utils/id.js";
import { UserModel } from "../User/model.js";

export const getUser = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id: gqlId }) => {
    const id = parseGqlID("user", gqlId);
    const user = await dataSource.getRepository(User).findOne({ where: { id } });
    if (!user) throw GraphQLNotFoundError("user", id);

    return new UserModel(user);
  }) satisfies QueryResolvers["user"];
