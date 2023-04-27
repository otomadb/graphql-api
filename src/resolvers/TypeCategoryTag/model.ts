import { CategoryTagType, CategoryTagTyping } from "@prisma/client";

export class TypeCategoryTagModel {
  private constructor(protected readonly typing: { id: string; tagId: string; type: CategoryTagType }) {}

  public static fromPrisma(typeing: CategoryTagTyping) {
    return new TypeCategoryTagModel({
      id: typeing.id,
      tagId: typeing.tagId,
      type: typeing.type,
    });
  }

  public get tagId() {
    return this.typing.tagId;
  }

  public get type() {
    return this.typing.type;
  }
}
