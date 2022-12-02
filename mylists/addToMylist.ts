import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import {
  getMylistEventsCollection,
  getMylistRegistrationsCollection,
  getMylistsCollection,
  getVideosCollection,
} from "../common/collections.js";
import { getUser, getUserById } from "../users/user.js";
import { MylistRegistration } from "./class.js";

export class AddToMylistPayload {
  private eventId: string;
  private registerationId: string;

  constructor({ eventId, registerationId }: { eventId: string; registerationId: string }) {
    this.eventId = eventId;
    this.registerationId = registerationId;
  }

  id() {
    return this.eventId;
  }

  async registration(_: unknown, { mongo }: { mongo: MongoClient }) {
    const registrationsColl = getMylistRegistrationsCollection(mongo);

    const reg = await registrationsColl.findOne({ _id: new ObjectId(this.registerationId) });
    if (!reg) throw new GraphQLError("no registration!");

    return new MylistRegistration({
      id: reg._id.toString(),
      mylistId: reg.mylist_id,
      videoId: reg.video_id,
      createdAt: reg.created_at,
      updatedAt: reg.updated_at,
      note: reg.note || null,
    });
  }
}

export class AddLikePayload extends AddToMylistPayload {}

export const addLike = async (
  { input }: { input: { videoId: string } },
  context: { mongo: MongoClient; userId?: string },
): Promise<AddLikePayload> => {
  if (!context.userId) throw new GraphQLError("Not login");
  const user = await getUserById(context.userId, context);
  const fav = await user.favorites({}, context);

  return addToMylist({ input: { ...input, mylistId: fav.id } }, context);
};

export const addToMylist = async (
  { input }: {
    input: {
      videoId: string;
      mylistId: string;
      note?: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
): Promise<AddToMylistPayload> => {
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
      .then((v) => !!v)
  ) {
    throw new GraphQLError("already registered");
  }

  const registerationId = await registerationsColl.insertOne(
    {
      mylist_id: input.mylistId,
      video_id: input.videoId,
      note: input.note || null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ).then((result) => result.insertedId);

  const eventId = await eventsColl.insertOne({
    created_at: new Date(),
    type: "ADD_TO_LIST",
    registration_id: registerationId,
  }).then((v) => v.insertedId);

  return new AddToMylistPayload({
    eventId: eventId.toString(),
    registerationId: registerationId.toString(),
  });
};
