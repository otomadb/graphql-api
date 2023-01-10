import { DataSource } from "typeorm";

import { MylistGroup } from "../../db/entities/mylist_group.js";
import { Resolvers } from "../../graphql.js";
import { buildGqlId, GraphQLNotExistsInDBError } from "../../utils/id.js";
import { UserModel } from "../User/model.js";
import { resolveMylists } from "./mylists.js";
import { resolveVideos } from "./videos.js";

export const resolveMylistGroup = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }) => buildGqlId("MylistGroup", id),
    holder: ({ id }) =>
      dataSource
        .getRepository(MylistGroup)
        .findOneOrFail({ where: { id }, relations: { holder: true } })
        .then((v) => new UserModel(v.holder))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", id);
        }),

    mylists: resolveMylists({ dataSource }),
    videos: resolveVideos({ dataSource }),
  } satisfies Resolvers["MylistGroup"]);
