import { parseGqlID as parseGqlIDOrThrowGqlError } from "../resolvers/id.js";
import { MkQueryResolver } from "../utils/MkResolver.js";

export const resolverGetBilibiliMADSource: MkQueryResolver<"getBilibiliMADSource", "BilibiliMADSourceService"> =
  ({ BilibiliMADSourceService }) =>
  async (_parent, { id }) =>
    BilibiliMADSourceService.getByIdOrThrow(parseGqlIDOrThrowGqlError("BilibiliMADSource", id));
