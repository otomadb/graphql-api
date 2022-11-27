import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getNiconicoCollection, getVideosCollection } from "../common/collections.js";
import { Video } from "../videos/class.js";

export class Niconico {
  public id;
  public videoId;

  constructor({ id, videoId }: { id: string; videoId: string }) {
    this.id = id;
    this.videoId = videoId;
  }

  async video(_: unknown, { mongo }: { mongo: MongoClient }) {
    const videoColl = getVideosCollection(mongo);
    const video = await videoColl.findOne({ _id: this.videoId });

    if (!video) return null;

    return new Video({
      id: video._id,
      thumbnails: video.thumbnails,
      titles: video.titles,
      tags: video.tags,
    });
  }
}

export const findNiconico = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const niconicoColl = getNiconicoCollection(context.mongo);

  const niconico = await niconicoColl.findOne({ _id: args.id });
  if (!niconico) throw new GraphQLError("Not Found");

  return new Niconico({
    id: niconico._id,
    videoId: niconico.video_id,
    // history: tag.history,
  });
};
