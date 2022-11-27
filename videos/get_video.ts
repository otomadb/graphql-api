import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getVideosCollection } from "../common/collections.js";
import { Video } from "./class.js";

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
    thumbnails: video.thumbnails,
  });
};
