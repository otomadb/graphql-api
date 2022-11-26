import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection, getVideoHistoryCollection, getVideosCollection } from "~/common/collections.ts";
import { VideoAddTagHistoryItem } from "./history_item_class.ts";

export const tagVideo = async (
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

  const tag = await tagsColl.findOne({ _id: input.tagId });
  if (!tag) throw new GraphQLError("no tag");

  const history = await historyColl
    .insertOne(
      {
        user_id: context.userId,
        created_at: new Date(),
        type: "ADD_TAG",
        tag_id: input.tagId,
        video_id: input.videoId,
      } as any,
    )
    .then((id) => historyColl.findOne({ _id: id }));
  if (!history || history.type !== "ADD_TAG") throw new GraphQLError("something wrong");

  await videosColl.updateOne(
    { _id: input.videoId },
    { $addToSet: { tags: input.tagId } },
  );

  const item = new VideoAddTagHistoryItem({
    id: history._id,
    tagId: history.tag_id,
    createdAt: history.created_at,
    userId: history.user_id,
    videoId: history.video_id,
  });

  return item;
};
