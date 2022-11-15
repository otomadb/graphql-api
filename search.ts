import { Database, ObjectId } from "mongo/mod.ts";
import { Result } from "./result.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";

export const searchVideos = async (db: Database, query: string): Promise<
  Result<{
    id: string;
    title_search: string;
    title_primary: string;
  }[]>
> => {
  const videosColl = getVideosCollection(db);
  const matched = await videosColl
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
    .toArray();
  return { ok: true, value: matched };
};

export const searchTags = async (db: Database, query: string): Promise<
  Result<{
    id: string;
    name_search: string;
    name_primary: string;
  }[]>
> => {
  const tagsColl = getTagsCollection(db);
  const matched = await tagsColl
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
    .toArray();
  return { ok: true, value: matched };
};

export const search = async (
  db: Database,
  query: string,
  target: { videos: boolean; tags: boolean },
): Promise<
  Result<{
    videos: null | {
      id: string;
      title_search: string;
      title_primary: string;
    }[];
    tags: null | {
      id: string;
      name_search: string;
      name_primary: string;
    }[];
  }>
> => {
  const videosResult = target.videos ? await searchVideos(db, query) : null;
  if (videosResult !== null && !videosResult.ok) return { ok: false, error: videosResult.error };
  const videos = videosResult?.value || null;

  const tagsResult = target.tags ? await searchTags(db, query) : null;
  if (tagsResult !== null && !tagsResult.ok) return { ok: false, error: tagsResult.error };
  const tags = tagsResult?.value || null;

  return {
    ok: true,
    value: {
      videos: videos,
      tags: tags,
    },
  };
};
