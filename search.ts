import { Database, ObjectId } from "mongo/mod.ts";
import { getTagsCollection, getVideosCollection, Result } from "./get_video.ts";

export const search = async (db: Database, query: string): Promise<
  Result<{
    videos: {
      id: string;
      title_search: string;
      title_primary: string;
    }[];
    tags: {
      id: string;
      name_search: string;
      name_primary: string;
    }[];
  }>
> => {
  const tagsColl = getTagsCollection(db);
  const videosColl = getVideosCollection(db);

  const matchedVideos = await videosColl
    .aggregate<{
      id: string;
      title_search: string;
      title_primary: string;
    }>([
      { "$unwind": { path: "$titles" } },
      { "$match": { "titles.title": { "$regex": query } } },
      {
        "$group": {
          "_id": "$_id",
          "id": { $first: "$id" },
          "title_search": { $first: "$titles.title" },
          "title_primary": { $first: "$title_primary" },
        },
      },
      { "$sort": { "id": -1 } },
      {
        "$project": {
          "_id": 0,
          "id": 1,
          "title_search": "$title_search",
          "title_primary": "$title_primary",
        },
      },
    ])
    .toArray();

  const matchedTags = await tagsColl
    .aggregate<{
      id: string;
      name_search: string;
      name_primary: string;
    }>([
      { "$unwind": { path: "$names" } },
      { "$match": { "names.name": { "$regex": query } } },
      {
        "$group": {
          "_id": "$_id",
          "id": { $first: "$id" },
          "name_search": { $first: "$names.name" },
          "name_primary": { $first: "$name_primary" },
        },
      },
      { "$sort": { "id": -1 } },
      {
        "$project": {
          "_id": 0,
          "id": 1,
          "name_search": "$name_search",
          "name_primary": "$name_primary",
        },
      },
    ])
    .toArray();

  return {
    ok: true,
    value: {
      videos: matchedVideos,
      tags: matchedTags,
    },
  };
};
