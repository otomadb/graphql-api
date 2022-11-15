export type Result<V> =
  | { ok: false; error: { status: number; message?: string } }
  | { ok: true; value: V };
