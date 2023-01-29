import { parsePrismaOrder } from "../../../utils/parsePrismaOrder.js";
import { QueryResolvers } from "../../graphql.js";
import { parseGqlIDs } from "../../id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const findSemitags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const execptIds = parseGqlIDs("Semitag", input.except);

    const semitags = await prisma.semitag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parsePrismaOrder(input.order?.createdAt),
        updatedAt: parsePrismaOrder(input.order?.updatedAt),
      },
      where: {
        id: { notIn: execptIds },
        isResolved: input.resolved?.valueOf(),
      },
    });
    return { nodes: semitags.map((t) => new SemitagModel(t)) };
  }) satisfies QueryResolvers["findSemitags"];
