import { DataSource } from "typeorm";

import { User } from "../../../db/entities/users.js";
import { QueryResolvers } from "../../../graphql.js";
import { GraphQLNotExistsInDBError, parseGqlID } from "../../../utils/id.js";
import { UserModel } from "../../User/model.js";

export const user = ({ dataSource }: { dataSource: DataSource }) =>
  (async (_parent, { id: gqlId }) => {
    const id = parseGqlID("User", gqlId);
    const user = await dataSource.getRepository(User).findOne({ where: { id } });
    if (!user) throw new GraphQLNotExistsInDBError("User", id);

    return new UserModel(user);
  }) satisfies QueryResolvers["user"];
