import { GraphQLError, GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection2 } from "../collections.ts";
import { GraphQLNonNullBoolean, GraphQLNonNullId, GraphQLNonNullString } from "./common.ts";
import { TagType } from "./tag.ts";

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

export const VideoType = new GraphQLObjectType<
  {
    id: string;
    titles: { title: string; primary?: boolean }[];
    tags: string[];
  },
  { mongo: MongoClient }
>({
  name: "Video",
  fields: () => ({
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
      async resolve({ tags: tagIds }, _args, context) {
        const tagsColl = getTagsCollection2(context.mongo);
        const tags = await tagsColl.find({ _id: { $in: tagIds } }).toArray();
        return tags.map(({ _id, names, type }) => ({ id: _id, names, type }));
      },
    },
  }),
});
