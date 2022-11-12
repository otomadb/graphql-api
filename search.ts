import { Database, ObjectId } from "mongo/mod.ts";
import { getTagsCollection, Result } from "./get_video.ts";

export const search = async (db: Database, query: string): Promise<
  Result<{
    tags: {
      id: string;
      name_search: string;
      name_primary: string;
    }[];
  }>
> => {
  const tagsColl = getTagsCollection(db);

  const matchedTags = await tagsColl
    .aggregate<{
      id: string;
      name_search: string;
      name_primary: string;
    }>([
      { "$unwind": { path: "$names" } },
      {
        "$project": {
          "_id": 0,
          "id": 1,
          "name_search": "$names.name",
          "name_primary": "$name_primary",
        },
      },
      { "$match": { "name_search": { "$regex": query } } },
      { "$limit": 10 },
    ])
    .toArray();

  return {
    ok: true,
    value: { tags: matchedTags },
  };
};
