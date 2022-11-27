import { customAlphabet } from "nanoid";

const idGenerator = customAlphabet(
  // abcdefghijklmnopqrstuvwxyz0123456789 - 0o1il
  "abcdefghjkmnpqrstuvwxyz23456789",
  12,
);

export const generateId = () => idGenerator();
