import { err, ok, Result } from "./Result.js";

export function checkDuplicate<T>(gqlIds: T[]): Result<T, T[]> {
  const ids: T[] = [];
  for (const gqlId of gqlIds) {
    if (ids.includes(gqlId)) return err(gqlId);
    ids.push(gqlId);
  }
  return ok(ids);
}
