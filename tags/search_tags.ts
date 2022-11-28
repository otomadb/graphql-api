import { MongoClient, ObjectId } from "mongodb";
import { getTagsCollection } from "../common/collections.js";
import { SearchTagsResultItem } from "./class.js";

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
      parents: { id: string; explicit: boolean }[]; // TODO: 嘘
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
      arr.map(({ matched_name, ...rest }) =>
        new SearchTagsResultItem({
          matchedName: matched_name,
        }, rest)
      )
    );

  return {
    result: matched,
  };
};
