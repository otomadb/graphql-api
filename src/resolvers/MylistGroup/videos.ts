import { MylistGroupResolvers } from "../../graphql.js";
import { ResolverDeps } from "../index.js";
import { MylistGroupVideoAggregationModel } from "../MylistGroupVideoAggregation/model.js";

export const resolveVideos = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: groupId }, { input }) => {
    /*
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
    */
    const videos = await prisma.mylistRegistration.groupBy({
      by: ["videoId"],
      where: { mylist: { includedGroups: { some: { groupId } } } },
      _count: { videoId: true },
      orderBy: { _count: { videoId: "asc" } },
      skip: input.skip,
      take: input.limit,
    });
    return videos.map(
      ({ _count, videoId }) =>
        new MylistGroupVideoAggregationModel({
          count: _count.videoId,
          videoId,
        })
    );
  }) satisfies MylistGroupResolvers["videos"];
