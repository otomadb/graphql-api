import { Database, ObjectId } from "mongo/mod.ts";
import { z } from "zod/mod.ts";
import { getTagsCollection } from "./collections.ts";
import { generateId } from "./id.ts";
import { Result } from "./result.ts";

const payloadSchema = z.object({
  primary_name: z.string(),
  extra_names: z.array(z.string()),
  type: z.enum([
    "WORK", // 作品名
    "CHARACTER", // キャラクター名，必ず作品名を文脈に持つ
    "MATERIAL", // その他の素材
    "STYLE", // 音MADの性質
    "SERIES", // 『BLU-Rayシリーズ』など
    "MUSIC", // 音楽
  ]),
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

  const { primary_name: primary_name, extra_names, type } = parsedPayload.data;
  const id = generateId();

  const tagsColl = getTagsCollection(db);

  const already = await tagsColl.findOne({ name_primary: primary_name });
  if (already) {
    return {
      ok: false,
      error: {
        status: 409,
        message: `"${primary_name}" is registered already as primary name.`,
      },
    };
  }

  await tagsColl.insertOne({
    _id: id,
    type: type,
    name_primary: primary_name,
    names: [
      { name: primary_name, primary: true },
      ...(extra_names?.map((extraName) => ({ name: extraName })) || []),
    ],
  });

  return { ok: true, value: { id } };
};
