import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLError,
  GraphQLFieldConfig,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection, getVideosCollection } from "./collections.ts";

const mc = new MongoClient();
await mc.connect("mongodb://user:pass@127.0.0.1:27017/otomadb?authSource=admin");
const db = mc.database();

export const GraphQLNonNullId = new GraphQLNonNull(GraphQLID);
export const GraphQLNonNullString = new GraphQLNonNull(GraphQLString);
export const GraphQLNonNullBoolean = new GraphQLNonNull(GraphQLBoolean);

export const TagNameType = new GraphQLObjectType<{ name: string; primary?: boolean }>({
  name: "TagName",
  fields: {
    name: { type: GraphQLNonNullString },
    primary: {
      type: GraphQLNonNullBoolean,
      resolve({ primary }): boolean {
        return !!primary;
      },
    },
  },
});

export const TagTypeEnumType = new GraphQLEnumType({
  name: "TagType",
  values: {
    "COPYRIGHT": {
      value: "COPYRIGHT",
    },
    "MATERIAL": {
      value: "MATERIAL",
    },
    "MUSIC": {
      value: "MUSIC",
    },
    "SERIES": {
      value: "SERIES",
    },
    "IMAGE": {
      value: "IMAGE",
    },
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

export const TagType = new GraphQLObjectType<{
  id: string;
  type: string;
  names: { name: string; primary?: boolean }[];
}>({
  name: "Tag",
  fields: {
    id: { type: GraphQLNonNullId },
    type: {
      type: new GraphQLNonNull(TagTypeEnumType),
    },
    name: {
      type: GraphQLNonNullString,
      resolve({ names }) {
        const name = names.find(({ primary }) => primary);
        if (!name) throw new GraphQLError("no primary name");
        return name.name;
      },
    },
    names: {
      type: new GraphQLNonNull(new GraphQLList(TagNameType)),
    },
  },
});

export const VideoTitleType = new GraphQLObjectType<{ title: string; primary?: boolean }>({
  name: "VideoTitle",
  fields: {
    title: { type: GraphQLNonNullString },
    primary: {
      type: GraphQLNonNullBoolean,
      resolve({ primary }): boolean {
        return !!primary;
      },
    },
  },
});

export const VideoType = new GraphQLObjectType<{
  id: string;
  titles: { title: string; primary?: boolean }[];
  tags: string[];
}>({
  name: "Video",
  fields: {
    id: { type: GraphQLNonNullId },
    titles: {
      type: new GraphQLNonNull(new GraphQLList(VideoTitleType)),
    },
    title: {
      type: GraphQLNonNullString,
      resolve({ titles }) {
        const title = titles.find(({ primary }) => primary);
        if (!title) throw new GraphQLError("no primary title");
        return title.title;
      },
    },
    tags: {
      type: new GraphQLNonNull(new GraphQLList(TagType)),
      async resolve({ tags: tagIds }) {
        const tagsColl = getTagsCollection(db);
        const tags = await tagsColl.find({ _id: { $in: tagIds } }).toArray();
        return tags.map(({ _id, names, type }) => ({ id: _id, names, type }));
      },
    },
  },
});

export const NonNullVideoType = new GraphQLNonNull(VideoType);

export const getVideo: GraphQLFieldConfig<
  unknown,
  unknown,
  { id: string }
> = {
  type: NonNullVideoType,
  args: { id: { type: GraphQLNonNullId } },
  async resolve(_, args) {
    const videosColl = getVideosCollection(db);
    const video = await videosColl.findOne({ _id: args.id });
    if (!video) throw new GraphQLError("Not Found");

    return {
      id: video._id,
      titles: video.titles,
      tags: video.tags,
    };
  },
};

export const getTag: GraphQLFieldConfig<
  unknown,
  unknown,
  { id: string }
> = {
  type: new GraphQLNonNull(TagType),
  args: { id: { type: GraphQLNonNullId } },
  async resolve(_, args) {
    const tagsColl = getTagsCollection(db);
    const tag = await tagsColl.findOne({ _id: args.id });
    if (!tag) throw new GraphQLError("Not Found");

    return {
      id: tag._id,
      type: tag.type,
      names: tag.names,
    };
  },
};

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    video: getVideo,
    tag: getTag,
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
});
