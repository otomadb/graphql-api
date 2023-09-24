import { GraphQLError } from "graphql";

import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkFindBilibiliMADSourceResolver: MkQueryResolver<"findBilibiliMADSource", "BilibiliMADSourceService"> =
  ({ BilibiliMADSourceService }) =>
  async (_, { input: { sourceId } }) => {
    if (!sourceId) throw new GraphQLError("sourceId must be provided");
    return BilibiliMADSourceService.findBySourceId(sourceId);
  };
