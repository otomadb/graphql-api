import { GraphQLError } from "graphql";

import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { YoutubeRegistrationRequestDTO } from "./YoutubeRegistrationRequest.dto.js";

export const mkFindUncheckedYoutubeRegistrationRequestsByOffsetResolver: MkQueryResolver<
  "findUncheckedYoutubeRegistrationRequestsByOffset",
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
      prisma.youtubeRegistrationRequest.findMany({
        where: { isChecked: false },
        orderBy: orderBy.data,
        take,
        skip,
      }),
      prisma.youtubeRegistrationRequest.count({
        where: { isChecked: false },
      }),
    ]);
    return {
      nodes: a.map((ss) => YoutubeRegistrationRequestDTO.fromPrisma(ss)),
      totalCount: b,
    };
  };
