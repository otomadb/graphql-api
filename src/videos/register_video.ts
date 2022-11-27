import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getNiconicoCollection, getVideoHistoryCollection, getVideosCollection } from "../common/collections.js";
import { generateId } from "../common/id.js";
import { Video } from "./class.js";

export const registerVideo = async (
  { input }: {
    input: {
      primaryTitle: string;
      extraTitles?: string[];
      tags: string[];
      primaryThumbnail: string;
      niconico?: string[];
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) {
    throw new GraphQLError("Not login");
  }
  const { userId } = context;

  const videosColl = getVideosCollection(context.mongo);
  const historyColl = getVideoHistoryCollection(context.mongo);
  const niconicoColl = getNiconicoCollection(context.mongo);

  const reservedVideoId = generateId();

  if (input.niconico) {
    for (const niconicoId of input.niconico) {
      const niconico = await niconicoColl.findOne({
        _id: niconicoId,
      });
      if (!niconico) {
        await niconicoColl.insertOne({
          _id: niconicoId,
          video_id: reservedVideoId,
        } as any);
      } else if (niconico?.video_id) {
        throw new GraphQLError(`Already registered ${niconico._id}`);
      }
    }
  }

  await historyColl.insertMany(
    [
      {
        type: "REGISTER",
        user_id: userId,
        video_id: reservedVideoId,
        created_at: new Date(),
      },
      {
        user_id: userId,
        video_id: reservedVideoId,
        created_at: new Date(),
        type: "ADD_TITLE",
        title: input.primaryTitle,
      } as any,
      {
        user_id: userId,
        video_id: reservedVideoId,
        created_at: new Date(),
        type: "CHANGE_PRIMARY_TITLE",
        from: null,
        to: input.primaryTitle,
      } as any,
      ...(input.extraTitles?.map(
        (extraTitle) => (
          {
            user_id: context.userId,
            created_at: new Date(),
            video_id: reservedVideoId,
            type: "ADD_TITLE",
            title: extraTitle,
          } as any
        ),
      ) || []),
      {
        user_id: userId,
        video_id: reservedVideoId,
        created_at: new Date(),
        type: "ADD_THUMBNAIL",
        thumbnail: input.primaryThumbnail,
      } as any,
      {
        user_id: userId,
        video_id: reservedVideoId,
        created_at: new Date(),
        type: "CHANGE_PRIMARY_THUMBNAIL",
        from: null,
        to: input.primaryThumbnail,
      } as any,
      ...input.tags.map(
        (tagId) => (
          {
            user_id: context.userId,
            created_at: new Date(),
            video_id: reservedVideoId,
            type: "ADD_TAG",
            tag_id: tagId,
          } as any
        ),
      ),
      ...(input.niconico?.map((niconicoId) =>
        ({
          user_id: context.userId,
          created_at: new Date(),
          video_id: reservedVideoId,
          type: "ADD_NICONICO_SOURCE",
          niconico_id: niconicoId,
        }) as any
      ) || []),
    ],
  );

  const videoAdd = await videosColl.insertOne({
    _id: reservedVideoId,
    titles: [
      { title: input.primaryTitle, primary: true },
      ...(input.extraTitles?.map((extraTitle) => ({ title: extraTitle })) || []),
    ],
    thumbnails: [
      { image_url: input.primaryThumbnail, primary: true },
    ],
    tags: input.tags,
  }).then(({ insertedId }) => videosColl.findOne({ _id: insertedId }));

  if (!videoAdd) throw new GraphQLError("something wrong");

  return {
    video: new Video({
      id: videoAdd._id,
      titles: videoAdd.titles,
      tags: videoAdd.tags,
      thumbnails: videoAdd.thumbnails,
    }),
  };
};
