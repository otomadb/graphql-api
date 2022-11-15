import { Database, ObjectId } from "mongo/mod.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";
import { Result } from "./result.ts";

export interface Tag {
  id: string;
  name_primary: string;
  context_name_primary: string | null;
  type: string;
}

export interface Video {
  id: string;
  title_primary: string;
  image_primary: string;
  tags: Tag[];
}

export const getTagContextName = async (db: Database, tagId: ObjectId): Promise<Result<string>> => {
  const tagsColl = getTagsCollection(db);
  const tagRaw = await tagsColl.findOne({ _id: tagId });

  if (!tagRaw) return { ok: false, error: { status: 404 } };

  const primary_title = tagRaw.names.find(({ primary }) => primary)?.name;
  if (!primary_title) {
    return { ok: false, error: { status: 500, message: `tag "${tagRaw._id}" primary name doesn't exists.` } };
  }
  return { ok: true, value: primary_title };
};

export const getTags = async (db: Database, tagIds: ObjectId[]): Promise<Result<Tag[]>> => {
  const tagsColl = getTagsCollection(db);
  const tagsRaw = await tagsColl.find({ _id: { $in: tagIds as any } }).toArray();
  const tags: Tag[] = [];

  for (const tagRaw of tagsRaw) {
    const primary_title = tagRaw.names.find(({ primary }) => primary)?.name;
    if (!primary_title) {
      return { ok: false, error: { status: 500, message: `tag "${tagRaw._id}" primary name doesn't exists.` } };
    }

    const primary_context_name = tagRaw.context && await getTagContextName(db, tagRaw.context);
    if (primary_context_name && !primary_context_name.ok) return primary_context_name;

    tags.push({
      id: tagRaw._id,
      type: tagRaw.type,
      name_primary: primary_title,
      context_name_primary: primary_context_name?.value || null,
    });
  }

  return { ok: true, value: tags };
};

export const getVideo = async (db: Database, id: string): Promise<Result<Video>> => {
  const videosColl = getVideosCollection(db);

  const video = await videosColl.findOne({ _id: id });

  if (!video) return { ok: false, error: { status: 404 } };

  const tagsResult = await getTags(db, video.tags);
  if (!tagsResult.ok) return { ok: false, error: tagsResult.error };

  return {
    ok: true,
    value: {
      id: video._id,
      title_primary: video.title_primary,
      image_primary: video.image_primary,
      tags: tagsResult.value,
    },
  };
};
