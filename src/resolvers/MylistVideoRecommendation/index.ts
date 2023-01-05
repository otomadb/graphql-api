import { DataSource } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistVideoRecommendation = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    origin: ({ originId }) =>
      dataSource
        .getRepository(Mylist)
        .findOneByOrFail({ id: originId })
        .then((v) => new MylistModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("mylist", originId);
        }),
    to: ({ toId }) =>
      dataSource
        .getRepository(Video)
        .findOneByOrFail({ id: toId })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("video", toId);
        }),
  } satisfies Resolvers["MylistVideoRecommendation"]);
