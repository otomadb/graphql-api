import { MylistGroupResolvers } from "../../graphql.js";
import { parsePrismaOrder } from "../../utils/parsePrismaOrder.js";
import { ResolverDeps } from "../index.js";
import { MylistGroupMylistInclusionModel } from "../MylistGroupMylistInclusion/model.js";

export const resolveMylists = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async ({ id }, { input }) => {
    const inclusions = await prisma.mylistGroupMylistInclsion.findMany({
      where: { group: { id } },
      take: input.limit,
      skip: input.skip,
      orderBy: {
        createdAt: parsePrismaOrder(input.order?.createdAt),
        updatedAt: parsePrismaOrder(input.order?.updatedAt),
      },
    });
    const nodes = inclusions.map((i) => new MylistGroupMylistInclusionModel(i));
    return { nodes };
  }) satisfies MylistGroupResolvers["mylists"];
