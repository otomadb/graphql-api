import { GraphQLError } from "graphql";

import { parseOrderBy } from "../resolvers/parseSortOrder.js";
import { MkQueryResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkFindMadsByOffsetResolver: MkQueryResolver<"findMadsByOffset", "VideoService" | "logger"> =
  ({ VideoService, logger }) =>
  async (_, { input: { offset, take, orderBy: unparsedOrderBy, filter: unparsedFilter } }, _ctx, info) => {
    const orderBy = parseOrderBy(unparsedOrderBy);
    if (isErr(orderBy)) {
      logger.error({ path: info.path, args: unparsedOrderBy }, "OrderBy args error");
      throw new GraphQLError("Wrong args");
    }

    const filter = {
      registeredAtLte: unparsedFilter?.registeredAtLte || null,
      registeredAtGte: unparsedFilter?.registeredAtGte || null,
    };

    return VideoService.findByOffset({ offset, take, orderBy: orderBy.data, filter });
  };
