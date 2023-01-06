import { DataSource } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { VideoTag } from "../../db/entities/video_tags.js";
import { MylistResolvers } from "../../graphql.js";
import { MylistTagInclusion } from "../MylistTagInclusion/model.js";

export const resolveIncludeTags = ({ dataSource }: { dataSource: DataSource }) =>
  (async ({ id: mylistId }, { input }) => {
    const result = await dataSource
      .getRepository(MylistRegistration)
      .createQueryBuilder("r")
      .where("r.mylist.id = :mylistId", { mylistId })
      .leftJoinAndSelect(VideoTag, "t", "t.video.id = r.video.id")
      .groupBy("t.tag")
      .select("t.tag.id", "tagId")
      .addSelect("COUNT(t.tag.id)", "count")
      .orderBy("count", input.order.count)
      .addOrderBy("t.tag.id", "ASC")
      .limit(input.limit)
      .skip(input.skip)
      .getRawMany<{ tagId: string; count: string }>();

    const items = result.map(
      ({ count, ...rest }) =>
        new MylistTagInclusion({
          ...rest,
          count: parseInt(count, 10),
          mylistId,
        })
    );

    return { items };
  }) satisfies MylistResolvers["includeTags"];
