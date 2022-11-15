import { Database, ObjectId } from "mongo/mod.ts";
import { getUsersCollections } from "./collections.ts";
import { Result } from "./result.ts";

export const getProfile = async (db: Database, id: string): Promise<Result<{ name: string }>> => {
  const userColl = getUsersCollections(db);

  const user = await userColl.findOne({ _id: new ObjectId(id) });
  if (!user) return { ok: false, error: { status: 404 } };

  return { ok: true, value: { name: user.name } };
};
