import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongo/mod.ts";
import { getTagHistoryCollection, getTagsCollection } from "~/common/collections.ts";
import { generateId } from "~/common/id.ts";
import { Tag } from "./class.ts";

export const registerTag = async (
  { input }: {
    input: {
      primaryName: string;
      extraNames?: string[];
      type: string;
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) throw new GraphQLError("Not login");
  // TODO: primaryNameとextraNamesが重複していないことの検証

  const tagsColl = getTagsCollection(context.mongo);
  const taghisColl = getTagHistoryCollection(context.mongo);

  const already = await tagsColl.findOne({
    "names.name": { "$in": [input.primaryName, ...(input.extraNames || [])] },
    "type": input.type,
  });
  if (already) {
    throw new GraphQLError(`"${input.primaryName}" in "${input.type}" already registered as primary name.`);
  }

  const taghistoryId = await taghisColl.insertOne({
    type: "REGISTER",
    user_id: context.userId,
    created_at: new Date(),
  }) as ObjectId;

  const id = generateId();
  const tagAdd = await tagsColl
    .insertOne({
      _id: id,
      type: input.type,
      names: [
        { name: input.primaryName, primary: true },
        ...(input.extraNames?.map((extraName) => ({ name: extraName })) || []),
      ],
      history: [taghistoryId],
    }).then(
      (id) => tagsColl.findOne({ _id: id }),
    );
  if (!tagAdd) throw new GraphQLError("Something wrong");

  return {
    tag: new Tag({
      id: tagAdd._id,
      names: tagAdd.names,
      type: tagAdd.type,
      history: tagAdd.history,
    }),
  };
};
