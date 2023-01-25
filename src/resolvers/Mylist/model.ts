import { Mylist } from "@prisma/client";

export class MylistModel {
  public id;
  public range;
  public title;
  public isLikeList: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor({ id, shareRange, title, createdAt, updatedAt, isLikeList }: Mylist) {
    this.id = id;
    this.title = title;
    this.range = shareRange;
    this.isLikeList = isLikeList;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
