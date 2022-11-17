import { buildSchema, GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection2, getVideosCollection2 } from "~/collections.ts";
import { Tag } from "./tag.ts";
import { Video } from "./video.ts";

export const schema = buildSchema(await Deno.readTextFile(new URL("./sdl.gql", import.meta.url)));

export const getVideo = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  console.log("?");

  const videosColl = getVideosCollection2(context.mongo);
  const video = await videosColl.findOne({ _id: args.id });
  if (!video) throw new GraphQLError("Not Found");

  return new Video({
    id: video._id,
    titles: video.titles,
    tags: video.tags,
  });
};

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

export const rootValue = {
  video: getVideo,
  tag: getTag,
};
