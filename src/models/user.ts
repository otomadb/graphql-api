import { User } from "../db/entities/users.js";
import { UserResolvers } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";

export class UserModel implements UserResolvers {
  constructor(private readonly user: User) {}

  id() {
    return addIDPrefix(ObjectType.User, this.user.id);
  }

  name() {
    return this.user.name;
  }

  displayName() {
    return this.user.displayName;
  }

  icon() {
    return this.user.icon;
  }
}
