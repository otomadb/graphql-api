import { MylistResolvers } from "../graphql.js";
import { MylistTagInclusionModel } from "../MylistTagInclusion/model.js";
import { ResolverDeps } from "../types.js";

export const resolveIncludeTags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id: mylistId }, { input }) => {
    /*
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
        new MylistTagInclusionModel({
          ...rest,
          count: parseInt(count, 10),
          mylistId,
        })
    );

    return { items };
    */
    const tags = await prisma.videoTag.groupBy({
      by: ["tagId"],
      where: { video: { mylists: { some: { mylistId } } } },
      _count: { tagId: true },
      orderBy: { _count: { tagId: "asc" } },
      skip: input.skip,
      take: input.limit,
    });
    return {
      items: tags.map(
        ({ _count, tagId }) =>
          new MylistTagInclusionModel({
            count: _count.tagId,
            mylistId,
            tagId,
          })
      ),
    };
  }) satisfies MylistResolvers["includeTags"];
