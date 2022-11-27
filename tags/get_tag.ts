import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getTagsCollection } from "../common/collections.js";
import { Tag } from "./class.js";

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
    // history: tag.history,
  });
};
