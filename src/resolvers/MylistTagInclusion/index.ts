import { DataSource } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { Tag } from "../../db/entities/tags.js";
import { Resolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { TagModel } from "../Tag/model.js";

export const resolveMylistTagInclusion = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    mylist: ({ mylistId }) =>
      dataSource
        .getRepository(Mylist)
        .findOneByOrFail({ id: mylistId })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Mylist", mylistId);
        }),
    tag: ({ tagId }) =>
      dataSource
        .getRepository(Tag)
        .findOneByOrFail({ id: tagId })
        .then((v) => new TagModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Tag", tagId);
        }),
  } satisfies Resolvers["MylistTagInclusion"]);
