import { MylistGroup } from "../../db/entities/mylist_group.js";

export class MylistGroupModel {
  public dbId: string;

  constructor(private readonly group: MylistGroup) {
    this.dbId = group.id;
  }
}
