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
  const historyColl = getTagHistoryCollection(context.mongo);

  const already = await tagsColl.findOne({
    "names.name": { "$in": [input.primaryName, ...(input.extraNames || [])] },
    "type": input.type,
  });
  if (already) {
    throw new GraphQLError(`"${input.primaryName}" in "${input.type}" already registered as primary name.`);
  }

  const reservedTagId = generateId();

  // register
  await historyColl.insertOne(
    {
      user_id: context.userId,
      created_at: new Date(),
      tag_id: reservedTagId,
      type: "REGISTER",
    } as any,
  );
  // add primary name
  await historyColl.insertOne(
    {
      user_id: context.userId,
      created_at: new Date(),
      tag_id: reservedTagId,
      type: "ADD_NAME",
      name: input.primaryName,
    } as any,
  );
  // change primary name
  await historyColl.insertOne(
    {
      user_id: context.userId,
      created_at: new Date(),
      tag_id: reservedTagId,
      type: "CHANGE_PRIMARY_NAME",
      from: null,
      to: input.primaryName,
    } as any,
  );
  // add extra names
  for (const extraName in input.extraNames) {
    await historyColl.insertOne(
      {
        user_id: context.userId,
        created_at: new Date(),
        tag_id: reservedTagId,
        type: "ADD_NAME",
        name: extraName,
      } as any,
    );
  }

  const add = await tagsColl
    .insertOne({
      _id: reservedTagId,
      type: input.type,
      names: [
        { name: input.primaryName, primary: true },
        ...(input.extraNames?.map((extraName) => ({ name: extraName })) || []),
      ],
      history: [],
    }).then((id) => tagsColl.findOne({ _id: id }));
  if (!add) throw new GraphQLError("Something wrong");

  return {
    tag: new Tag({
      id: add._id,
      names: add.names,
      type: add.type,
      history: add.history,
    }),
  };
};
