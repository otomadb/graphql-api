import { DataSource } from "typeorm";

import { VideoTag } from "../../db/entities/video_tags.js";
import { VideoResolvers } from "../../graphql.js";
import { TagModel } from "../Tag/model.js";

export const resolveTags = ({ dataSource }: { dataSource: DataSource }) =>
  (({ id: videoId }, { input }) =>
    dataSource
      .getRepository(VideoTag)
      .find({
        where: { video: { id: videoId } },
        relations: { tag: true },
        take: input.limit?.valueOf(),
        skip: input.skip.valueOf(),
        order: {
          createdAt: input.order.createdAt || undefined,
          updatedAt: input.order.updatedAt || undefined,
        },
      })
      .then((ts) => ts.map(({ tag }) => new TagModel(tag)))) satisfies VideoResolvers["tags"];
