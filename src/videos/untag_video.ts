import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getTagsCollection, getVideoHistoryCollection, getVideosCollection } from "../common/collections.js";
import { VideoDeleteTagHistoryItem } from "./history_item_class.js";

export const untagVideo = async (
  { input }: {
    input: {
      videoId: string;
      tagId: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) throw new GraphQLError("Not login");

  const videosColl = getVideosCollection(context.mongo);
  const tagsColl = getTagsCollection(context.mongo);
  const historyColl = getVideoHistoryCollection(context.mongo);

  const video = await videosColl.findOne({ _id: input.videoId });
  if (!video) throw new GraphQLError("no video");
  if (!video.tags.includes(input.tagId)) {
    throw new GraphQLError(`not tagged by ${input.tagId} to video ${input.videoId}`);
  }

  const tag = await tagsColl.findOne({ _id: input.tagId });
  if (!tag) {
    throw new GraphQLError("no tag");
  }

  const history = await historyColl
    .insertOne(
      {
        user_id: context.userId,
        created_at: new Date(),
        type: "DELETE_TAG",
        tag_id: input.tagId,
        video_id: input.videoId,
      } as any,
    )
    .then(({ insertedId: id }) => historyColl.findOne({ _id: id }));
  if (!history || history.type !== "DELETE_TAG") throw new GraphQLError("something wrong");

  await videosColl.updateOne(
    { _id: input.videoId },
    { $pull: { "tags": input.tagId } },
  );

  const item = new VideoDeleteTagHistoryItem({
    id: history._id,
    tagId: history.tag_id,
    createdAt: history.created_at,
    userId: history.user_id,
    videoId: history.video_id,
  });

  return item;
};
