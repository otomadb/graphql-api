import { MongoClient } from "mongodb";
import { getVideosCollection } from "../common/collections.js";
import { Video } from "../videos/class.js";

export class NiconicoSource {
  public id;
  public videoId;

  constructor({ id, videoId }: { id: string; videoId: string }) {
    this.id = id;
    this.videoId = videoId;
  }

  get __typename() {
    return "NiconicoSource";
  }

  async video(_: unknown, { mongo }: { mongo: MongoClient }) {
    const videoColl = getVideosCollection(mongo);
    const video = await videoColl.findOne({ _id: this.videoId });

    if (!video) {
      return null;
    }

    return new Video({
      id: video._id,
      thumbnails: video.thumbnails,
      titles: video.titles,
      tags: video.tags,
    });
  }
}
