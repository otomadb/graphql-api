import { MkQueryResolver } from "../utils/MkResolver.js";
import { splitDate } from "../utils/splitDate.js";

export const mkCalcMadCountGrowthResolver: MkQueryResolver<"calcMadCountGrowth", "VideoService"> =
  ({ VideoService }) =>
  async (_parent, { input: { start, end, split } }) => {
    const splits = splitDate(start, end, split);
    return VideoService.calcGrowth(splits);
  };
