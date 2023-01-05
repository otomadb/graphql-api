import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Resolvers } from "../../graphql.js";
import { addIDPrefix, GraphQLNotExistsInDBError, ObjectType } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistRegistration = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    id: ({ id }) => addIDPrefix(ObjectType.MylistRegistration, id),

    mylist: async ({ id }) =>
      dataSource
        .getRepository(MylistRegistration)
        .findOneOrFail({ where: { id }, relations: { mylist: true } })
        .then((v) => new MylistModel(v.mylist))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("MylistGroupMylistInclusion", id);
        }),
    video: async ({ id }) =>
      dataSource
        .getRepository(MylistRegistration)
        .findOneOrFail({ where: { id }, relations: { video: true } })
        .then((v) => new VideoModel(v.video))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("MylistGroupMylistInclusion", id);
        }),
  } satisfies Resolvers["MylistRegistration"]);
