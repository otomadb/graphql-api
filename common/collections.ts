import { MongoClient, ObjectId } from "mongo/mod.ts";

/*
const data = new Identicon("d3b07384d113edec49eaa6238ad5ff00").toString();

console.dir(`data:image/png;base64,${data}`);
*/

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
    thumbnails: { image_url: string; primary?: boolean }[];
  }>("videos");

export const getUsersCollection = (mongo: MongoClient) =>
  mongo.database().collection<{
    _id: string;

    name: string;
    display_name: string;

    icon: string;
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
