import { Database } from "mongo/mod.ts";
import { RouterMiddleware } from "oak/mod.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";

export const routeGetTag = (db: Database): RouterMiddleware<"/tags/:id"> => async ({ params, request, response }) => {
  const tagsColl = getTagsCollection(db);
  const videosColl = getVideosCollection(db);

  const tagRaw = await tagsColl.findOne({ _id: params.id });
  if (!tagRaw) {
    response.status = 404;
    return;
  }

  const context = tagRaw.context ? await tagsColl.findOne({ _id: tagRaw.context }) : null;
  if (tagRaw.context && !context) {
    response.status = 404;
    response.body = `tag ${params.id} context does not exists.`;
    return;
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

  response.body = {
    id: tagRaw._id,
    name_primary: tagRaw.name_primary,
    context: context ? { id: context._id, name_primary: context.name_primary } : null,
    tagged_videos,
  };
  return;
};
