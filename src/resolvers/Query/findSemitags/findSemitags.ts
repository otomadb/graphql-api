import { QueryResolvers } from "../../graphql.js";
import { parseGqlIDs } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { parseSortOrder } from "../../parseSortOrder.js";
import { SemitagModel } from "../../Semitag/model.js";

export const findSemitags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const execptIds = parseGqlIDs("Semitag", input.except);

    const semitags = await prisma.semitag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parseSortOrder(input.order?.createdAt),
        updatedAt: parseSortOrder(input.order?.updatedAt),
      },
      where: {
        id: { notIn: execptIds },
        isChecked: input.resolved?.valueOf(),
      },
    });
    return { nodes: semitags.map((t) => new SemitagModel(t)) };
  }) satisfies QueryResolvers["findSemitags"];
