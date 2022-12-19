import { Mylist } from "../../db/entities/mylists.js";

export class MylistModel {
  public id;
  public range;
  public title;
  public isLikeList: boolean;

  constructor(private readonly mylist: Mylist) {
    this.id = mylist.id;
    this.range = mylist.range;
    this.title = mylist.title;
    this.isLikeList = mylist.isLikeList;
  }
}
