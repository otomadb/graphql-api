import { Database } from "mongo/mod.ts";
import { getTagsCollection, getVideosCollection, Result } from "./get_video.ts";

export const getTag = async (db: Database, id: string): Promise<
  Result<{
    id: string;
    name_primary: string;
    tagged_videos: {
      id: string;
      title_primary: string;
      image_primary: string;
    }[];
  }>
> => {
  const tagsColl = getTagsCollection(db);
  const videosColl = getVideosCollection(db);

  const tagRaw = await tagsColl.findOne({ id: id });
  if (!tagRaw) return { ok: false, error: { status: 404 } };

  const tagged_videos = await videosColl
    .aggregate<{
      id: string;
      image_primary: string;
      title_primary: string;
    }>([
      {
        "$match": {
          "tags": tagRaw._id,
        },
      },
      {
        "$project": {
          _id: 0,
          id: true,
          image_primary: true,
          title_primary: true,
        },
      },
    ])
    .toArray();

  return {
    ok: true,
    value: {
      id: tagRaw.id,
      name_primary: tagRaw.name_primary,
      tagged_videos,
    },
  };
};
