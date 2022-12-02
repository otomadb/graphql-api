import { GraphQLError } from "graphql";
import { MongoClient } from "mongodb";
import { getMylistsCollection } from "../common/collections.js";
import { Mylist } from "./class.js";

export const getMylist = async (
  args: { id: string },
  context: { mongo: MongoClient },
) => {
  const mylistsColl = getMylistsCollection(context.mongo);
  const mylist = await mylistsColl.findOne({ _id: args.id });
  if (!mylist) {
    throw new GraphQLError("Not Found");
  }

  return new Mylist({
    id: mylist._id,
    title: mylist.title,
    holderId: mylist.holder_id,
    range: mylist.range,
  });
};
