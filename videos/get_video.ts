import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getVideosCollection } from "~/common/collections.ts";
import { Video } from "./class.ts";

export const getVideo = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const videosColl = getVideosCollection(context.mongo);
  const video = await videosColl.findOne({ _id: args.id });
  if (!video) {
    throw new GraphQLError("Not Found");
  }

  return new Video({
    id: video._id,
    titles: video.titles,
    tags: video.tags,
    history: video.history,
    thumbnails: video.thumbnails,
  });
};
