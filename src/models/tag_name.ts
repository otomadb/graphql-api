import { TagName } from "../db/entities/tag_names.js";
import { TagNameResolvers } from "../graphql/resolvers.js";

export class TagNameModel implements TagNameResolvers {
  constructor(private readonly tagName: TagName) {}

  name() {
    return this.tagName.name;
  }

  primary() {
    return this.tagName.primary;
  }
}
