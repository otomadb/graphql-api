import { GraphQLError } from "graphql";
import { Driver as Neo4jDriver, Neo4jError } from "neo4j-driver";
import { DataSource, In } from "typeorm";

import { MylistRegistration } from "../../db/entities/mylist_registrations.js";
import { Mylist, MylistShareRange } from "../../db/entities/mylists.js";
import { Tag } from "../../db/entities/tags.js";
import { Video } from "../../db/entities/videos.js";
import { MylistShareRange as MylistGQLShareRange } from "../../graphql/resolvers.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { calcMylistIncludeTags } from "../../neo4j/mylist_include_tags.js";
import { calcRecommendedVideosByMylist } from "../../neo4j/mylist_recommend_videos.js";
import { addIDPrefix, ObjectType, removeIDPrefix } from "../../utils/id.js";
import { MylistRegistrationModel } from "../MylistRegistration/models.js";
import { TagModel } from "../Tag/model.js";
import { UserModel } from "../User/model.js";
import { VideoModel } from "../Video/model.js";

export const resolveMylist = ({
  dataSource,
  neo4jDriver,
}: {
  dataSource: DataSource;
  neo4jDriver: Neo4jDriver;
}): Resolvers["Mylist"] => ({
  id: ({ id }) => addIDPrefix(ObjectType.Mylist, id),
  range: ({ range }) => {
    switch (range) {
      case MylistShareRange.PUBLIC:
        return MylistGQLShareRange.Public;
      case MylistShareRange.KNOW_LINK:
        return MylistGQLShareRange.KnowLink;
      case MylistShareRange.PRIVATE:
        return MylistGQLShareRange.Private;
      default:
        throw new Error("Unknown Mylist Range");
    }
  },
  holder: async ({ id: mylistId }) => {
    const mylist = await dataSource.getRepository(Mylist).findOne({
      where: { id: mylistId },
      relations: { holder: true },
    });
    if (!mylist) throw new GraphQLError(`holder for mylist ${mylistId} is not found`);
    return new UserModel(mylist.holder);
  },
  registrations: async ({ id: mylistId }) => {
    const regs = await dataSource.getRepository(MylistRegistration).find({
      where: { mylist: { id: mylistId } },
      relations: { mylist: true, video: true },
    });
    return {
      nodes: regs.map(
        ({ id, note, createdAt, updatedAt, video: { id: videoId }, mylist: { id: mylistId } }) =>
          new MylistRegistrationModel({ id, note, createdAt, updatedAt, videoId, mylistId })
      ),
    };
  },

  isIncludesVideo: async ({ id: mylistId }, { id: videoId }) =>
    dataSource
      .getRepository(MylistRegistration)
      .findOne({
        where: {
          mylist: { id: mylistId },
          video: { id: removeIDPrefix(ObjectType.Video, videoId) },
        },
      })
      .then((r) => !!r),

  recommendedVideos: async ({ id: videoId }, { input }) => {
    const recommends = await calcRecommendedVideosByMylist(neo4jDriver)(videoId, { limit: input.limit });

    const items = await dataSource
      .getRepository(Video)
      .find({ where: { id: In(recommends.map(({ videoId }) => videoId)) } })
      .then((vs) =>
        recommends.map(({ videoId, score }) => {
          const video = vs.find((v) => v.id === videoId)!; // TODO: 危険
          return { video: new VideoModel(video), score };
        })
      );

    return { items };
  },
  includeTags: async ({ id: mylistId }, { input: { limit } }) => {
    try {
      const neo4jResults = await calcMylistIncludeTags(neo4jDriver)(mylistId, { limit });

      const items = await dataSource
        .getRepository(Tag)
        .find({ where: { id: In(neo4jResults.map(({ tagId }) => tagId)) } })
        .then((ts) =>
          neo4jResults.map(({ tagId, count }) => {
            const tag = ts.find((t) => t.id === tagId);
            if (!tag) throw new GraphQLError(`Data inconcistency is occuring for "tag:${tagId}"`);
            return { tag: new TagModel(tag), count };
          })
        );

      return { items };
    } catch (e) {
      if (e instanceof Neo4jError) throw new GraphQLError("Something wrong about Neo4j");
      throw new GraphQLError("Something wrong");
    }
  },
});
