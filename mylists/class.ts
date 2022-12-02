import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import {
  getMylistRegistrationsCollection,
  getMylistsCollection,
  getUsersCollection,
  getVideosCollection,
} from "../common/collections.js";
import { User } from "../users/class.js";
import { Video } from "../videos/mod.js";

export class MylistRegistration {
  public id;
  public createdAt;
  public updatedAt;
  public note;
  private mylistId;
  private videoId;

  constructor({ id, videoId, createdAt, mylistId, note, updatedAt }: {
    id: string;
    videoId: string;
    mylistId: string;
    createdAt: Date;
    updatedAt: Date;
    note: string | null;
  }) {
    this.id = id;
    this.note = note;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.videoId = videoId;
    this.mylistId = mylistId;
  }

  get __typename() {
    return "MylistRegistration";
  }

  async video(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Video> {
    const videosColl = getVideosCollection(mongo);

    const video = await videosColl.findOne({ _id: this.videoId });
    if (!video) {
      throw new GraphQLError("no video found");
    }

    return new Video({
      id: video._id,
      titles: video.titles,
      tags: video.tags,
      thumbnails: video.thumbnails,
    });
  }

  async mylist(_: unknown, { mongo }: { mongo: MongoClient }): Promise<Mylist> {
    const mylistsColl = getMylistsCollection(mongo);
    const mylist = await mylistsColl.findOne({ _id: this.mylistId });
    if (!mylist) {
      throw new GraphQLError("no mylist found");
    }

    return new Mylist({
      id: mylist._id,
      title: mylist.title,
      holderId: mylist.holder_id,
      range: mylist.range,
      createdAt: mylist.created_at,
    });
  }
}

export class Mylist {
  public id;
  public title;
  private holderId;
  public range;
  public createdAt;

  constructor({ id, title, holderId, range, createdAt }: {
    id: string;
    title: string;
    holderId: string;
    range: "PUBLIC" | "KNOW_LINK" | "PRIVATE";
    createdAt: Date;
  }) {
    this.id = id;
    this.title = title;
    this.holderId = holderId;
    this.range = range;
    this.createdAt = createdAt;
  }

  async holder(_: unknown, { mongo }: { mongo: MongoClient }): Promise<User> {
    const usersColl = getUsersCollection(mongo);

    const user = await usersColl.findOne({ _id: this.holderId });
    if (!user) {
      throw new GraphQLError("no user found");
    }

    return new User({
      id: user._id,
      name: user.name,
      displayName: user.display_name,
      icon: user.icon,
    });
  }

  async includes({ videoId }: { videoId: string }, { mongo }: { mongo: MongoClient }) {
    try {
      return getMylistRegistrationsCollection(mongo)
        .findOne({ mylist_id: this.id, video_id: videoId })
        .then((v) => !!v);
    } catch (e) {
      throw new GraphQLError("something broken");
    }
  }

  async updatedAt(_: unknown, context: { mongo: MongoClient }) {
    const { nodes } = await this.registrations(
      { input: { limit: 1, order: { updatedAt: "DESC" } } },
      context,
    );
    return nodes.at(0)?.updatedAt || this.createdAt;
  }

  async registrations(
    { input: { limit, skip, order } }: {
      input: {
        limit?: number;
        skip?: number;
        order?: {
          createdAt?: "ASC" | "DESC";
          updatedAt?: "ASC" | "DESC";
        };
      };
    },
    { mongo }: { mongo: MongoClient },
  ) {
    const registrationsColl = getMylistRegistrationsCollection(mongo);
    const ae = await registrationsColl.aggregate<
      {
        _id: ObjectId;
        video_id: string;
        mylist_id: string;
        created_at: Date;
        updated_at: Date;
        note?: string;
      }
    >(
      [
        { "$match": { "mylist_id": this.id } },
        {
          "$sort": {
            "updated_at": order?.updatedAt === "ASC" ? 1 : -1,
            "created_at": order?.createdAt === "ASC" ? 1 : -1,
          },
        },
        ...(limit ? [{ $limit: limit }] : []),
        ...(skip ? [{ $skip: skip }] : []),
      ],
    ).toArray();

    return {
      nodes: ae.map(({ _id, mylist_id, video_id, created_at, updated_at, note }) =>
        new MylistRegistration({
          id: _id.toString(),
          mylistId: mylist_id,
          videoId: video_id,
          createdAt: created_at,
          updatedAt: updated_at,
          note: note || null,
        })
      ),
    };
  }
}
