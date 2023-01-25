import { QueryResolvers } from "../../../graphql.js";
import { parseGqlIDs } from "../../../utils/id.js";
import { ResolverDeps } from "../../index.js";
import { SemitagModel } from "../../Semitag/model.js";

export const findSemitags = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, { input }) => {
    const execptIds = parseGqlIDs("Semitag", input.except);

    const semitags = await prisma.semitag.findMany({
      take: input.limit,
      skip: input.skip,
      orderBy: {
        // TODO: Prisma
        createdAt: "asc",
        /*
        createdAt: input.order?.createdAt || undefined,
        updatedAt: input.order?.updatedAt || undefined,
        */
      },
      where: {
        id: { notIn: execptIds },
        isResolved: input.resolved || undefined,
      },
    });
    return { nodes: semitags.map((t) => new SemitagModel(t)) };
  }) satisfies QueryResolvers["findSemitags"];
