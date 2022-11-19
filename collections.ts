import { MongoClient } from "mongo/mod.ts";

export const getTagsCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;

    names: { name: string; primary?: boolean }[];
    type: string;
    context?: string;

    history: { type: string; userId: string }[];
  }>("tags");

export const getVideosCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;

    titles: { title: string; primary?: boolean }[];
    title_primary: string;

    images: { image: string; primary?: boolean }[];
    image_primary: string;

    tags: string[];
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
