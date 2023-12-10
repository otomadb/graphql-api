import z from "zod";

export const schemaConnArgs = z.union([
  z.object({
    first: z.number(),
    after: z.string().optional(),
  }),
  z.object({
    last: z.number(),
    before: z.string().optional(),
  }),
]);

export const schemaConnArgsAcceptAll = z.union([
  z.object({
    first: z.number(),
    after: z.string().optional(),
  }),
  z.object({
    last: z.number(),
    before: z.string().optional(),
  }),
  z.object({}),
]);
