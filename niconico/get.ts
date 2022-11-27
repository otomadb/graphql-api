import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getNiconicoCollection } from "../common/collections.js";
import { NiconicoSource } from "./class.js";

export const getNiconicoSource = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const niconicoColl = getNiconicoCollection(context.mongo);

  const niconico = await niconicoColl.findOne({ _id: args.id });
  if (!niconico) {
    throw new GraphQLError("Not Found");
  }

  return new NiconicoSource({
    id: niconico._id,
    videoId: niconico.video_id,
  });
};
