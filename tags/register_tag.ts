import { GraphQLError } from "graphql";
import { MongoClient, ObjectId } from "mongodb";
import { getTagHistoryCollection, getTagsCollection } from "../common/collections.js";
import { generateId } from "../common/id.js";
import { Tag } from "./class.js";

export const registerTag = async (
  { input }: {
    input: {
      primaryName: string;
      extraNames?: string[];

      explicitParent?: string;
      implicitParents?: string[];
    };
  },
  context: { mongo: MongoClient; userId?: string },
) => {
  if (!context.userId) throw new GraphQLError("Not login");
  // TODO: primaryNameとextraNamesが重複していないことの検証

  const tagsColl = getTagsCollection(context.mongo);
  const historyColl = getTagHistoryCollection(context.mongo);

  const already = await tagsColl.findOne({
    "names.name": {
      $in: [input.primaryName, ...(input.extraNames || [])],
    },
    "parents.id": {
      $in: [
        ...(input.explicitParent ? [input.explicitParent] : []),
        ...(input.implicitParents || []),
      ],
    },
  });
  if (already) throw new GraphQLError(`already registered`);

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
      type: "MATERIAL",
      names: [
        { name: input.primaryName, primary: true },
        ...(input.extraNames?.map((extraName) => ({ name: extraName })) || []),
      ],
      parents: [
        ...(input.explicitParent ? [{ id: input.explicitParent, explicit: true }] : []),
        ...(input.implicitParents?.map((id) => ({ id, explicit: false })) || []),
      ],
    }).then(({ insertedId }) => tagsColl.findOne({ _id: insertedId }));
  if (!add) throw new GraphQLError("Something wrong");

  return {
    tag: new Tag({
      id: add._id,
      names: add.names,
      type: add.type,
      parents: add.parents || [],
    }),
  };
};

// { "names.name": {$in: ["姫坂乃愛"]}, "parents.id": "rdtvsdgdzzdb" }
