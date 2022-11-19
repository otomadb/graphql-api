import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection2, getVideosCollection2 } from "./collections.ts";
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
  private _id;
  private _names;
  private _type;

  constructor({ id, names, type }: {
    id: string;
    names: { name: string; primary?: boolean }[];
    type: string;
  }) {
    this._id = id;
    this._names = names;
    this._type = type;
  }

  id() {
    return this._id;
  }

  names() {
    return this._names.map((v) => new TagName(v));
  }

  name() {
    const name = this.names().find((v) => v.primary());
    if (!name) throw new GraphQLError("no primary title");
    return name.name();
  }

  type() {
    return this._type;
  }

  async taggedVideos(_: unknown, context: { mongo: MongoClient }) {
    const videosColl = getVideosCollection2(context.mongo);
    const tagged_videos = (
      await videosColl
        .aggregate([
          { "$match": { "tags": this.id() } },
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

export const getTag = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const tagsColl = getTagsCollection2(context.mongo);
  const tag = await tagsColl.findOne({ _id: args.id });
  if (!tag) throw new GraphQLError("Not Found");

  return new Tag({
    id: tag._id,
    type: tag.type,
    names: tag.names,
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
  const tagsColl = getTagsCollection2(context.mongo);
  const matched = await tagsColl
    .aggregate<{
      id: string;
      names: { name: string; primary?: boolean }[];
      type: string;
      matched_name: string;
    }>([
      {
        $project: {
          _id: true,
          names: true,
          names_search: "$names",
          type: true,
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
          matched_name: { $first: "$names_search.name" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          names: "$names",
          type: "$type",
          matched_name: "$matched_name",
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
