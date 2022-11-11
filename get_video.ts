import { Database, ObjectId } from "mongo/mod.ts";

export interface TagsDocument {
  id: string;
  names: { name: string; primary?: boolean }[];
  type: string;
  context?: ObjectId;
}

export interface VideosDocument {
  id: string;
  titles: { title: string; primary?: boolean }[];
  images: { image: string; primary?: boolean }[];
  tags: ObjectId[];
}

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

export type Result<V> =
  | { ok: false; error: { status: 404 | 500; message?: string } }
  | { ok: true; value: V };

export const getTagContextName = async (db: Database, tagId: ObjectId): Promise<Result<string>> => {
  const tagsColl = db.collection<TagsDocument>("tags");
  const tagRaw = await tagsColl.findOne({ _id: tagId });

  if (!tagRaw) return { ok: false, error: { status: 404 } };

  const primary_title = tagRaw.names.find(({ primary }) => primary)?.name;
  if (!primary_title) {
    return { ok: false, error: { status: 500, message: `tag "${tagRaw.id}" primary name doesn't exists.` } };
  }
  return { ok: true, value: primary_title };
};

export const getTags = async (db: Database, tagIds: ObjectId[]): Promise<Result<Tag[]>> => {
  const tagsColl = db.collection<{
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
    context?: ObjectId;
  }>("tags");
  const tagsRaw = await tagsColl.find({ _id: { $in: tagIds } }).toArray();
  const tags: Tag[] = [];

  for (const tagRaw of tagsRaw) {
    const primary_title = tagRaw.names.find(({ primary }) => primary)?.name;
    if (!primary_title) {
      return { ok: false, error: { status: 500, message: `tag "${tagRaw.id}" primary name doesn't exists.` } };
    }

    const primary_context_name = tagRaw.context && await getTagContextName(db, tagRaw.context);
    if (primary_context_name && !primary_context_name.ok) return primary_context_name;

    tags.push({
      id: tagRaw.id,
      type: tagRaw.type,
      name_primary: primary_title,
      context_name_primary: primary_context_name?.value || null,
    });
  }

  return { ok: true, value: tags };
};

export const getVideo = async (db: Database, id: string): Promise<Result<Video>> => {
  const videosColl = db.collection<VideosDocument>("videos");

  const video = await videosColl.findOne({ id });

  if (!video) return { ok: false, error: { status: 404 } };

  const title_primary = video.titles.find(({ primary }) => primary)?.title;
  if (!title_primary) {
    return { ok: false, error: { status: 500, message: `video "${id}" primary title doesn't exists.` } };
  }

  const image_primary = video.images.find(({ primary }) => primary)?.image;
  if (!image_primary) {
    return { ok: false, error: { status: 500, message: `video "${id}" primary image doesn't exists.` } };
  }

  const tagsResult = await getTags(db, video.tags);
  if (!tagsResult.ok) return { ok: false, error: tagsResult.error };

  return {
    ok: true,
    value: {
      id: video.id,
      title_primary: title_primary,
      image_primary: image_primary,
      tags: tagsResult.value,
    },
  };
};
