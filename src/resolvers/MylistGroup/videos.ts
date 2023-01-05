import { DataSource } from "typeorm";

import { MylistGroupMylistInclusion } from "../../db/entities/mylist_group.js";
import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { MylistGroupResolvers } from "../../graphql.js";
import { MylistGroupVideoAggregationModel } from "../MylistGroupVideoAggregation/model.js";

export const resolveVideos = ({ dataSource }: { dataSource: DataSource }) =>
  (async ({ id }, { input }) => {
    const aggr = await dataSource
      .getRepository(MylistGroupMylistInclusion)
      .createQueryBuilder("i")
      .where("i.group.id = :id", { id })
      .leftJoinAndSelect(MylistRegistration, "r", "r.mylistId = i.mylistId")
      .groupBy("r.video")
      .select("r.video", "videoId")
      .addSelect("COUNT(r.video)", "count")
      .addSelect("array_agg(r.mylistId)", "mylistIds")
      .orderBy("count", input.order.count)
      .addOrderBy("r.video", "ASC")
      .limit(input.limit)
      .skip(input.skip)
      .getRawMany<{ videoId: string; mylistIds: string[] }>();

    return aggr.map((v) => new MylistGroupVideoAggregationModel(v));
  }) satisfies MylistGroupResolvers["videos"];
