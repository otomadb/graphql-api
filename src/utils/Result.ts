export type Result<TError, TData> = { status: "error"; error: TError } | { status: "ok"; data: TData };
