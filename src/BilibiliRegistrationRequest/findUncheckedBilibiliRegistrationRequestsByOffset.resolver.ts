import { GraphQLError } from "graphql";

import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { BilibiliRegistrationRequestDTO } from "./BilibiliRegistrationRequest.dto.js";

export const mkFindUncheckedBilibiliRegistrationRequestsByOffsetResolver: MkQueryResolver<
  "findUncheckedBilibiliRegistrationRequestsByOffset",
  "prisma" | "logger"
> =
  ({ prisma, logger }) =>
  async (_, { input: { orderBy: unparsedOrderBy, skip, take } }, _ctx, info) => {
    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    const [a, b] = await prisma.$transaction([
      prisma.bilibiliRegistrationRequest.findMany({
        where: { isChecked: false },
        orderBy: orderBy.data,
        take,
        skip,
      }),
      prisma.bilibiliRegistrationRequest.count({
        where: { isChecked: false },
      }),
    ]);
    return {
      nodes: a.map((ss) => BilibiliRegistrationRequestDTO.fromPrisma(ss)),
      totalCount: b,
    };
  };
