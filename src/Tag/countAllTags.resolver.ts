import { MkQueryResolver } from "../utils/MkResolver.js";

export const mkCountAllTagsResolver: MkQueryResolver<"countAllTags", "TagsService"> =
  ({ TagsService }) =>
  () =>
    TagsService.countAll();
