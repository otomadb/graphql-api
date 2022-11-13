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
    context: {
      id: string;
      name_primary: string;
    } | null;
  }>
> => {
  const tagsColl = getTagsCollection(db);
  const videosColl = getVideosCollection(db);

  const tagRaw = await tagsColl.findOne({ _id: id });
  if (!tagRaw) return { ok: false, error: { status: 404 } };

  const context = tagRaw.context ? await tagsColl.findOne({ _id: tagRaw.context }) : null;
  if (tagRaw.context && !context) {
    return { ok: false, error: { status: 404, message: `tag ${id} context does not exists.` } };
  }

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
          _id: false,
          id: "$_id",
          image_primary: true,
          title_primary: true,
        },
      },
    ])
    .toArray();

  return {
    ok: true,
    value: {
      id: tagRaw._id,
      name_primary: tagRaw.name_primary,
      context: context
        ? {
          id: context._id,
          name_primary: context.name_primary,
        }
        : null,
      tagged_videos,
    },
  };
};
