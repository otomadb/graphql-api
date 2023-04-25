import { GraphQLError } from "graphql";

import { isErr } from "../../../utils/Result.js";
import { QueryResolvers } from "../../graphql.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { parseOrderBy } from "../../parseSortOrder.js";
import { ResolverDeps } from "../../types.js";

export const resolverFindUncheckedNicovideoRegistrationRequestsByOffset = ({
  prisma,
  logger,
}: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_, { input: { orderBy: unparsedOrderBy, skip, take } }, _ctx, info) => {
    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    const [a, b] = await prisma.$transaction([
      prisma.nicovideoRegistrationRequest.findMany({
        where: { isChecked: false },
        orderBy: orderBy.data,
        take,
        skip,
      }),
      prisma.nicovideoRegistrationRequest.count({
        where: { isChecked: false },
      }),
    ]);
    return {
      nodes: a.map((ss) => NicovideoRegistrationRequestModel.fromPrisma(ss)),
      totalCount: b,
    };
  }) satisfies QueryResolvers["findUncheckedNicovideoRegistrationRequestsByOffset"];
