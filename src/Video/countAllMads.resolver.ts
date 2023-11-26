import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkCountAllMadsResolver: MkQueryResolver<"countAllMads", "VideoService"> =
  ({ VideoService }) =>
  () =>
    VideoService.countAll();
