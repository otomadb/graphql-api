import { Mylist } from "@prisma/client";

export class MylistModel {
  constructor(private readonly mylist: Mylist) {}

  public static fromPrisma(mylist: Mylist) {
    return new MylistModel(mylist);
  }

  public get id() {
    return this.mylist.id;
  }

  public get shareRange() {
    return this.mylist.shareRange;
  }

  public get title() {
    return this.mylist.title;
  }

  public get isLikeList() {
    return this.mylist.isLikeList;
  }

  public get createdAt() {
    return this.mylist.createdAt;
  }

  public get updatedAt() {
    return this.mylist.updatedAt;
  }

  public get holderId() {
    return this.mylist.holderId;
  }

  get slug() {
    return this.mylist.slug;
  }
}
