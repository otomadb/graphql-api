import { DataSource, In } from "typeorm";

import { Mylist } from "../../db/entities/mylists.js";
import { Video } from "../../db/entities/videos.js";
import { Resolvers } from "../../graphql.js";
import { GraphQLNotExistsInDBError } from "../../utils/id.js";
import { MylistModel } from "../Mylist/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylistGroupVideoAggregation = ({ dataSource }: { dataSource: DataSource }) =>
  ({
    video: ({ videoId }) =>
      dataSource
        .getRepository(Video)
        .findOneOrFail({ where: { id: videoId } })
        .then((v) => new VideoModel(v))
        .catch(() => {
          throw new GraphQLNotExistsInDBError("Video", videoId);
        }),
    mylists: ({ mylistIds }, { input }) =>
      dataSource
        .getRepository(Mylist)
        .find({
          where: { id: In(mylistIds) },
          order: {
            createdAt: input.order.createdAt || undefined,
            updatedAt: input.order.updatedAt || undefined,
          },
          take: input.limit,
          skip: input.skip,
        })
        .then((ls) => ls.map((l) => new MylistModel(l))),
    count: ({ mylistIds }) => mylistIds.length,
  } satisfies Resolvers["MylistGroupVideoAggregation"]);
