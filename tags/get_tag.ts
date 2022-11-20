import { GraphQLError } from "graphql";
import { MongoClient } from "mongo/mod.ts";
import { getTagsCollection } from "~/common/collections.ts";
import { Tag } from "./class.ts";

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
