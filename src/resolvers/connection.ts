export const cursorOptions = {
  encodeCursor: (cursor: { id: string }) => Buffer.from(JSON.stringify(cursor)).toString("base64url"),
  decodeCursor: (cursor: string) => JSON.parse(Buffer.from(cursor, "base64url").toString("ascii")),
};
