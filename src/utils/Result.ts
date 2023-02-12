type OkPayload<TData> = { status: "ok"; data: TData };
export type Ok<TResult> = TResult extends OkPayload<infer TData> ? OkPayload<TData> : never;
export const ok = <TData>(data: TData): OkPayload<TData> => ({ status: "ok", data });

type ErrPayload<TErr> = { status: "error"; error: TErr };
export type Err<TResult> = TResult extends ErrPayload<infer TErr> ? ErrPayload<TErr> : never;
export const err = <TErr>(error: TErr): ErrPayload<TErr> => ({ status: "error", error });

export type Result<TErr, TData> = ErrPayload<TErr> | OkPayload<TData>;
