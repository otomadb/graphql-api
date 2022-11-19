import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagHistoryCollection, getTagsCollection, getUsersCollection, getVideosCollection } from "./collections.ts";
import { generateId } from "./id.ts";
import { User } from "./user.ts";
import { Video } from "./video.ts";

/*
export const TagTypeEnumType = new GraphQLEnumType({
  name: "TagType",
  values: {
    "COPYRIGHT": { value: "COPYRIGHT" },
    "MATERIAL": { value: "MATERIAL" },
    "MUSIC": { value: "MUSIC" },
    "SERIES": { value: "SERIES" },
    "IMAGE": { value: "IMAGE" },
    "TACTICS": {
      value: "TACTICS",
    },
    "CLASS": {
      value: "CLASS",
    },
    "EVENT": {
      value: "EVENT",
    },
  },
});
*/

export class TagName {
  private _name;
  private _primary;

  constructor({ name, primary }: { name: string; primary?: boolean }) {
    this._name = name;
    this._primary = primary;
  }

  name() {
    return this._name;
  }

  primary() {
    return !!this._primary;
  }
}

export class Tag {
  protected id;
  protected type;
  private _names;
  private _history;

  constructor({ id, names, type, history }: {
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
    history: ObjectId[];
  }) {
    this.id = id;
    this._names = names;
    this.type = type;
    this._history = history;
  }

  names() {
    return this._names.map((v) => new TagName(v));
  }

  name() {
    const name = this.names().find((v) => v.primary());
    if (!name) throw new GraphQLError("no primary title");
    return name.name();
  }

  async history(_: unknown, context: { mongo: MongoClient }) {
    const taghistColls = getTagHistoryCollection(context.mongo);
    const items = await taghistColls.find({ _id: { $in: this._history } }).toArray();
    return items.map(
      ({ _id, type, user_id, created_at }) => {
        switch (type) {
          case "REGISTER":
            return new TagRegisterHistoryItem({
              id: _id,
              userId: user_id,
              createdAt: created_at,
            });
          default:
            throw new GraphQLError("something wrong");
        }
      },
    );
  }

  async taggedVideos(_: unknown, context: { mongo: MongoClient }) {
    const videosColl = getVideosCollection(context.mongo);
    const tagged_videos = (
      await videosColl
        .aggregate([
          { "$match": { "tags": this.id } },
          {
            "$project": {
              _id: false,
              id: "$_id",
              titles: true,
              tags: true,
            },
          },
        ])
        .toArray()
    ).map((v) => new Video(v as any));
    return tagged_videos;
  }
}

export class TagRegisterHistoryItem {
  private _id: ObjectId;
  private _userId: string;
  protected createdAt: Date;

  constructor({ id, userId, createdAt }: { id: ObjectId; userId: string; createdAt: Date }) {
    this._id = id;
    this._userId = userId;
    this.createdAt = createdAt;
  }

  get __typename() {
    return "TagRegisterHistoryItem";
  }

  id() {
    return this._id.toString();
  }

  async user(_: unknown, { mongo }: { mongo: MongoClient }): Promise<User> {
    const usersColl = getUsersCollection(mongo);

    const user = await usersColl.findOne({ _id: this._userId });
    if (!user) throw new GraphQLError("no user found");

    return new User({
      id: user._id,
      name: user.name,
      displayName: user.display_name,
    });
  }
}

export const getTag = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const tagsColl = getTagsCollection(context.mongo);
  const tag = await tagsColl.findOne({ _id: args.id });
  if (!tag) throw new GraphQLError("Not Found");

  return new Tag({
    id: tag._id,
    type: tag.type,
    names: tag.names,
    history: tag.history,
  });
};

export class SearchTagsResultItem {
  matchedName;
  tag;

  constructor({ matchedName }: { matchedName: string }, tagPayload: ConstructorParameters<typeof Tag>[0]) {
    this.matchedName = matchedName;
    this.tag = new Tag(tagPayload);
  }
}

export const searchTags = async (
  args: { query: string; limit: number; skip: number },
  context: { mongo: MongoClient },
) => {
  const tagsColl = getTagsCollection(context.mongo);
  const matched = await tagsColl
    .aggregate<{
      matched_name: string;
      id: string;
      names: { name: string; primary?: boolean }[];
      type: string;
      history: ObjectId[];
    }>([
      {
        $project: {
          _id: true,
          names: true,
          names_search: "$names",
          type: true,
          history: true,
        },
      },
      { $unwind: { path: "$names_search" } },
      { $match: { "names_search.name": { "$regex": args.query } } },
      {
        $sort: {
          "names_search.primary": -1,
        },
      },
      {
        $group: {
          _id: "$_id",
          names: { $first: "$names" },
          type: { $first: "$type" },
          history: { $first: "$history" },
          matched_name: { $first: "$names_search.name" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          names: true,
          type: true,
          history: true,
          matched_name: true,
        },
      },
      { $skip: args.skip },
      { $limit: args.limit },
    ])
    .toArray()
    .then((arr) =>
      arr.map(({ matched_name, ...rest }) => new SearchTagsResultItem({ matchedName: matched_name }, rest))
    );

  return {
    result: matched,
  };
};

export const registerTag = async (
  { input }: {
    input: {
      primaryName: string;
      extraNames?: string[];
      type: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) throw new GraphQLError("Not login");
  // TODO: primaryNameとextraNamesが重複していないことの検証

  const tagsColl = getTagsCollection(context.mongo);
  const taghisColl = getTagHistoryCollection(context.mongo);

  const already = await tagsColl.findOne({
    "names.name": { "$in": [input.primaryName, ...(input.extraNames || [])] },
    "type": input.type,
  });
  if (already) {
    throw new GraphQLError(`"${input.primaryName}" in "${input.type}" already registered as primary name.`);
  }

  const taghistoryId = await taghisColl.insertOne({
    type: "REGISTER",
    user_id: context.userId,
    created_at: new Date(),
  }) as ObjectId;

  const id = generateId();
  const tagAdd = await tagsColl
    .insertOne({
      _id: id,
      type: input.type,
      names: [
        { name: input.primaryName, primary: true },
        ...(input.extraNames?.map((extraName) => ({ name: extraName })) || []),
      ],
      history: [taghistoryId],
    }).then(
      (id) => tagsColl.findOne({ _id: id }),
    );
  if (!tagAdd) throw new GraphQLError("Something wrong");

  return {
    tag: new Tag({
      id: tagAdd._id,
      names: tagAdd.names,
      type: tagAdd.type,
      history: tagAdd.history,
    }),
  };
};
