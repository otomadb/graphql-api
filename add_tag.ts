import { Database, ObjectId } from "mongo/mod.ts";
import { z } from "zod/mod.ts";
import { Result } from "./check_niconico_video.ts";
import { generateId } from "./id.ts";

export const getTagsCollection = (db: Database) =>
  db.collection<{
    _id: string;

    names: { name: string; primary?: boolean }[];
    name_primary: string;

    type: string;
    context?: ObjectId;
  }>("tags");

const payloadSchema = z.object({
  name_primary: z.string(),
  extra_names: z.array(z.string()),
  type: z.enum(["MUSIC", "WORK", "CHARACTER", "MATERIAL", "SERIES"]),
}).partial({
  extra_names: true,
});

export const addTag = async (db: Database, payload: unknown): Promise<Result<{ id: string }>> => {
  const parsedPayload = payloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return {
      ok: false,
      error: { status: 400 },
    };
  }

  const { name_primary, extra_names, type } = parsedPayload.data;
  const id = generateId();

  const tagsColl = getTagsCollection(db);

  const already = await tagsColl.findOne({ name_primary: name_primary });
  if (already) {
    return {
      ok: false,
      error: {
        status: 409,
        message: `"${name_primary}" is registered already as primary name.`,
      },
    };
  }

  await tagsColl.insertOne({
    _id: id,
    type: type,
    name_primary: name_primary,
    names: [
      { name: name_primary, primary: true },
      ...(extra_names?.map((extraName) => ({ name: extraName })) || []),
    ],
  });

  return { ok: true, value: { id } };
};
