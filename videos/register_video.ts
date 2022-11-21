import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getVideoHistoryCollection, getVideosCollection } from "~/common/collections.ts";
import { generateId } from "~/common/id.ts";
import { Video } from "./class.ts";

export const registerVideo = async (
  { input }: {
    input: {
      primaryTitle: string;
      extraTitles: string[];
      tags: string[];
      primaryThumbnail: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) {
    throw new GraphQLError("Not login");
  }
  const { userId } = context;

  const videosColl = getVideosCollection(context.mongo);
  const videoHisColl = getVideoHistoryCollection(context.mongo);

  const videoId = generateId();

  const historyIdRegisterVideo = await videoHisColl.insertOne({
    type: "REGISTER",
    user_id: userId,
    video_id: videoId,
    created_at: new Date(),
  }) as ObjectId;
  const historyIdsAddTag = await videoHisColl.insertMany(
    input.tags.map((tag) => ({
      type: "ADD_TAG",
      user_id: userId,
      video_id: videoId,
      created_at: new Date(),
      tag_id: tag,
    })),
  );

  const videoAdd = await videosColl.insertOne({
    _id: videoId,
    titles: [
      { title: input.primaryTitle, primary: true },
      ...(input.extraTitles?.map((extraTitle) => ({ title: extraTitle })) || []),
    ],
    tags: input.tags,
    history: [historyIdRegisterVideo, ...historyIdsAddTag.insertedIds],
    thumbnails: [
      { image_url: input.primaryThumbnail, primary: true },
    ],
  }).then((id) => videosColl.findOne({ _id: id }));

  if (!videoAdd) {
    throw new GraphQLError("somwthing wrong");
  }

  return {
    video: new Video({
      id: videoAdd._id,
      titles: videoAdd.titles,
      tags: videoAdd.tags,
      history: videoAdd.history,
      thumbnails: videoAdd.thumbnails,
    }),
  };
};
