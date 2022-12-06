import { TagParentResolvers } from "~/codegen/resolvers.js";
import { TagParent } from "~/db/entities/tag_parents.js";

import { TagModel } from "./tag.js";

export class TagParentModel implements TagParentResolvers {
  public static needRelations = { parent: true } as const;

  constructor(private readonly tagParent: TagParent) {}

  explicit() {
    return this.tagParent.explicit;
  }

  tag() {
    return new TagModel(this.tagParent.parent);
  }
}
