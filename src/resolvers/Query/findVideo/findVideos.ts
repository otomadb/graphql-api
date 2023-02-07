import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { VideoModel } from "../../Video/model.js";

const schema = z.union([z.object({ id: z.string() }), z.object({ serial: z.number() })]);

export const findVideo = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input: unparsedInput }) => {
    const parsed = schema.safeParse(unparsedInput);
    if (!parsed.success) throw new GraphQLError("Argument 'input' is invalid.");

    const input = parsed.data;

    if ("id" in input) {
      const v = await prisma.video.findFirst({ where: { id: input.id } });
      if (!v) return null;
      return new VideoModel(v);
    } else {
      const v = await prisma.video.findFirst({ where: { serial: input.serial } });
      if (!v) return null;
      return new VideoModel(v);
    }
  }) satisfies QueryResolvers["findVideo"];
