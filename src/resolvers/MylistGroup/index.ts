import { DataSource } from "typeorm";

import { Resolvers } from "../../graphql.js";
import { buildGqlId } from "../../utils/id.js";

export const resolveMylistRegistration = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ dbId }) => buildGqlId("mylistGroup", dbId),
  } satisfies Resolvers["MylistGroup"]);
