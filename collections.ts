import { MongoClient, ObjectId } from "mongo/mod.ts";

export const getTagsCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;

    names: { name: string; primary?: boolean }[];
    type: string;
    context?: string;

    history: ObjectId[];
  }>("tags");

export const getVideosCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
    history: ObjectId[];
  }>("videos");

export const getUsersCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;

    name: string;
    display_name: string;
    // email: string;
    // is_email_confirmed: boolean;
    // password: string;
  }>("users");

export const getAccountsCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;
    user_id: string;

    name: string;
    email: string;
    email_confirmed: true;

    password: string;
    // email: string;
    // is_email_confirmed: boolean;
    // password: string;
  }>("accounts");

export const getTagHistoryCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: ObjectId;
    type: string;
    created_at: Date;
    user_id: string;
  }>("tag_history");

export const getVideoHistoryCollection = (mongo: MongoClient) =>
  mongo.database().collection<
    & {
      _id: ObjectId;
      created_at: Date;
      user_id: string;
      video_id: string;
    }
    & (
      | { type: "REGISTER" }
      | { type: "ADD_TAG"; tag_id: string }
    )
  >("video_history");
