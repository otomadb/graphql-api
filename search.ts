import { Database } from "mongo/mod.ts";
import { RouterMiddleware } from "oak/mod.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";

export const routeSearch = (db: Database): RouterMiddleware<"/search"> => async ({ params, request, response }) => {
  const query = request.url.searchParams.get("query");
  if (!query || query === "") {
    response.status = 400;
    return;
  }

  const targets = request.url.searchParams.get("targets")?.split(",");

  const tagsColl = getTagsCollection(db);
  const matchedTags = targets?.includes("tags")
    ? await tagsColl
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
            "name_search": { $first: "$names.name" },
            "name_primary": { $first: "$name_primary" },
          },
        },
        {
          "$project": {
            "_id": false,
            "id": "$_id",
            "name_search": "$name_search",
            "name_primary": "$name_primary",
          },
        },
      ])
      .toArray()
    : null;

  const videosColl = getVideosCollection(db);
  const matchedVideos = targets?.includes("videos")
    ? await videosColl
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
            "title_search": { $first: "$titles.title" },
            "title_primary": { $first: "$title_primary" },
          },
        },
        {
          "$project": {
            "_id": false,
            "id": "$_id",
            "title_search": "$title_search",
            "title_primary": "$title_primary",
          },
        },
      ])
      .toArray()
    : null;

  response.body = {
    tags: matchedTags,
    videos: matchedVideos,
  };
  return;
};
