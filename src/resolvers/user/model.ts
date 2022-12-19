import { User } from "../../db/entities/users.js";

export class UserModel {
  public id;
  public name;
  public displayName;
  public icon;

  constructor(private readonly user: User) {
    this.id = user.id;
    this.name = user.name;
    this.displayName = user.displayName;
    this.icon = user.icon;
  }
}
