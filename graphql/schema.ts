import { GraphQLError, GraphQLFieldConfig, GraphQLNonNull, GraphQLObjectType, GraphQLSchema } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection2, getVideosCollection2 } from "~/collections.ts";
import { GraphQLNonNullId } from "./common.ts";
import { TagType } from "./tag.ts";
import { VideoType } from "./video.ts";

export const getVideo = (): GraphQLFieldConfig<
  unknown,
  { mongo: MongoClient },
  { id: string }
> => ({
  type: new GraphQLNonNull(VideoType),
  args: { id: { type: GraphQLNonNullId } },
  async resolve(_, args, context) {
    const videosColl = getVideosCollection2(context.mongo);
    const video = await videosColl.findOne({ _id: args.id });
    if (!video) throw new GraphQLError("Not Found");

    return {
      id: video._id,
      titles: video.titles,
      tags: video.tags,
    };
  },
});

export const getTag = (): GraphQLFieldConfig<
  unknown,
  { mongo: MongoClient },
  { id: string }
> => ({
  type: new GraphQLNonNull(TagType),
  args: { id: { type: GraphQLNonNullId } },
  async resolve(_, args, context) {
    const tagsColl = getTagsCollection2(context.mongo);
    const tag = await tagsColl.findOne({ _id: args.id });
    if (!tag) throw new GraphQLError("Not Found");

    return {
      id: tag._id,
      type: tag.type,
      names: tag.names,
    };
  },
});

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    video: getVideo(),
    tag: getTag(),
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
});
