import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { TagModel } from "../../Tag/model.js";

const schema = z.union([z.object({ id: z.string() }), z.object({ serial: z.number() })]);

export const findTag = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: unparsedInput }) => {
    const parsed = schema.safeParse(unparsedInput);
    if (!parsed.success) throw new GraphQLError("Argument 'input' is invalid.");

    const input = parsed.data;

    if ("id" in input) {
      const t = await prisma.tag.findFirst({ where: { id: input.id } });
      if (!t) return null;
      return new TagModel(t);
    } else {
      const t = await prisma.tag.findFirst({ where: { serial: input.serial } });
      if (!t) return null;
      return new TagModel(t);
    }
  }) satisfies QueryResolvers["findTag"];
