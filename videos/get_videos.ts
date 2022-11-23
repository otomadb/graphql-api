import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getVideoHistoryCollection, getVideosCollection } from "~/common/collections.ts";
import { Video } from "./class.ts";

export const getVideos = async (
  { input }: { input: { limit?: number; skip?: number } },
  context: { mongo: MongoClient },
) => {
  const videosColl = getVideosCollection(context.mongo);
  const historyColl = getVideoHistoryCollection(context.mongo);

  const videoIds = await historyColl
    .aggregate<{ video_id: string }>([
      { $match: { "type": "REGISTER" } },
      { $sort: { "created_at": -1 } },
      { $project: { "video_id": 1 } },
      ...(input.skip ? [{ $skip: input.skip }] : []),
      ...(input.limit ? [{ $limit: input.limit }] : []),
    ])
    .toArray()
    .then((arr) => arr.map(({ video_id }) => video_id));

  const nodes = await Promise.all(
    videoIds.map(async (id) => {
      const video = await videosColl.findOne({ _id: id });
      if (!video) throw new GraphQLError("something wrong");
      return new Video({
        id: video._id,
        titles: video.titles,
        thumbnails: video.thumbnails,
        tags: video.tags,
      });
    }),
  );

  return {
    nodes,
  };
};
