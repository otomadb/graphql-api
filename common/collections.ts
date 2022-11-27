import { MongoClient, ObjectId } from "mongodb";

/*
import Identicon from "identicon";
const data = new Identicon("d3b07384d113edec49eaa62300").toString();
console.dir(`data:image/png;base64,${data}`);
*/

export const getTagsCollection = (mongo: MongoClient) =>
  mongo.db().collection<{
    _id: string;

    names: { name: string; primary?: boolean }[];
    type: string;
    context?: string;
  }>("tags");

export const getVideosCollection = (mongo: MongoClient) =>
  mongo.db().collection<{
    _id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
    thumbnails: { image_url: string; primary?: boolean }[];
  }>("videos");

export const getUsersCollection = (mongo: MongoClient) =>
  mongo.db().collection<{
    _id: string;

    name: string;
    display_name: string;

    icon: string;
    // email: string;
    // is_email_confirmed: boolean;
    // password: string;
  }>("users");

export const getAccountsCollection = (mongo: MongoClient) =>
  mongo.db().collection<{
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
  mongo.db().collection<
    & {
      _id: ObjectId;
      created_at: Date;
      user_id: string;
      tag_id: string;
    }
    & (
      | { type: "REGISTER" }
      // name
      | {
        type: "ADD_NAME";
        name: string;
      }
      | {
        type: "DELETE_NAME";
        name: string;
      }
      | {
        type: "CHANGE_PRIMARY_NAME";
        from: null | string;
        to: string;
      }
    )
  >("tag_history");

export const getVideoHistoryCollection = (mongo: MongoClient) =>
  mongo.db().collection<
    & {
      _id: ObjectId;
      created_at: Date;
      user_id: string;
      video_id: string;
    }
    & (
      | { type: "REGISTER" }
      // titles
      | {
        type: "ADD_TITLE";
        title: string;
      }
      | {
        type: "DELETE_TITLE";
        title: string;
      }
      | {
        type: "CHANGE_PRIMARY_TITLE";
        from: null | string;
        to: string;
      }
      // thumbnails
      | {
        type: "ADD_THUMBNAIL";
        thumbnail: string;
      }
      | {
        type: "DELETE_THUMBNAIL";
        thumbnail: string;
      }
      | {
        type: "CHANGE_PRIMARY_THUMBNAIL";
        from: null | string;
        to: string;
      }
      // tags
      | {
        type: "ADD_TAG";
        tag_id: string;
      }
      | {
        type: "DELETE_TAG";
        tag_id: string;
      }
    )
  >("video_history");

export const getNiconicoCollection = (mongo: MongoClient) =>
  mongo.db().collection<{
    _id: string;
    video_id: string;
  }>("niconico");
