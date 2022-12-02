import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import {
  getMylistEventsCollection,
  getMylistRegistrationsCollection,
  getMylistsCollection,
  getVideosCollection,
} from "../common/collections.js";
import { getUserById } from "../users/user.js";

export class RemoveFromMylistPayload {
  private eventId: string;

  constructor({ eventId }: { eventId: string }) {
    this.eventId = eventId;
  }

  id() {
    return this.eventId;
  }
}

export class RemoveLikePayload extends RemoveFromMylistPayload {}

export const removeLike = async (
  { input }: { input: { videoId: string } },
  context: { mongo: MongoClient; userId?: string },
): Promise<RemoveLikePayload> => {
  if (!context.userId) throw new GraphQLError("Not login");
  const user = await getUserById(context.userId, context);
  const fav = await user.favorites({}, context);

  return removeFromMylist({ input: { ...input, mylistId: fav.id } }, context);
};

export const removeFromMylist = async (
  { input }: {
    input: {
      videoId: string;
      mylistId: string;
      note?: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
): Promise<RemoveFromMylistPayload> => {
  if (!context.userId) throw new GraphQLError("Not login");

  const videosColl = getVideosCollection(context.mongo);
  const mylistsColl = getMylistsCollection(context.mongo);
  const registerationsColl = getMylistRegistrationsCollection(context.mongo);
  const eventsColl = getMylistEventsCollection(context.mongo);

  const video = await videosColl.findOne({ _id: input.videoId });
  if (!video) {
    throw new GraphQLError("video not found");
  }
  const mylist = await mylistsColl.findOne({ _id: input.mylistId });
  if (!mylist) {
    throw new GraphQLError("mylist not found");
  } else if (mylist.holder_id !== context.userId) {
    throw new GraphQLError("you're not the holder of mylist");
  }

  if (
    await registerationsColl
      .findOne({ video_id: input.videoId, mylist_id: input.mylistId })
      .then((v) => !v)
  ) {
    throw new GraphQLError("not registered");
  }
  await registerationsColl.deleteOne({
    video_id: input.videoId,
    mylist_id: input.mylistId,
  });

  const eventId = await eventsColl.insertOne({
    created_at: new Date(),
    type: "REMOVE_FROM_LIST",
  }).then((v) => v.insertedId);

  return new RemoveFromMylistPayload({
    eventId: eventId.toString(),
  });
};
