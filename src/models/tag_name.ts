import { TagNameResolvers } from "~/codegen/resolvers.js";
import { TagName } from "~/db/entities/tag_names.js";

export class TagNameModel implements TagNameResolvers {
  constructor(private readonly tagName: TagName) {}

  name() {
    return this.tagName.name;
  }

  primary() {
    return this.tagName.primary;
  }
}
