export const ok = <TData>(data: TData) => ({ status: "ok", data } as const);
export type Ok<TResult> = TResult extends ReturnType<typeof ok<infer TErr>> ? ReturnType<typeof ok<TErr>> : never;
export type OkData<TResult> = Ok<TResult>["data"];

export const err = <TErr>(error: TErr) => ({ status: "error", error } as const);
export type Err<TResult> = TResult extends ReturnType<typeof err<infer TErr>> ? ReturnType<typeof err<TErr>> : never;
export type ErrError<TResult> = Err<TResult>["error"];

export type Result<TErr, TData> = ReturnType<typeof err<TErr>> | ReturnType<typeof ok<TData>>;
