import { dataSource } from "../db/data-source.js";
import { MylistRegistration } from "../db/entities/mylist_registrations.js";
import { Mylist, MylistShareRange as MylistEntityShareRange } from "../db/entities/mylists.js";
import { MylistResolvers, MylistShareRange as MylistGQLShareRange } from "../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../utils/id.js";
import { MylistRegistrationModel } from "./mylist_registration.js";
import { UserModel } from "./user.js";

export class MylistModel implements MylistResolvers {
  public static readonly needRelations = { holder: true } as const;

  constructor(private readonly mylist: Mylist) {}

  id() {
    return addIDPrefix(ObjectType.Mylist, this.mylist.id);
  }

  title() {
    return this.mylist.title;
  }

  range() {
    switch (this.mylist.range) {
      case MylistEntityShareRange.PUBLIC:
        return MylistGQLShareRange.Public;
      case MylistEntityShareRange.KNOW_LINK:
        return MylistGQLShareRange.KnowLink;
      case MylistEntityShareRange.PRIVATE:
        return MylistGQLShareRange.Private;
      default:
        throw new Error("Unknown Mylist Range");
    }
  }

  holder() {
    return new UserModel(this.mylist.holder);
  }

  async registrations() {
    const regs = await dataSource.getRepository(MylistRegistration).find({
      where: {
        mylist: {
          id: this.mylist.id,
        },
      },
    });

    return { nodes: regs.map((r) => new MylistRegistrationModel(r)) };
  }

  createdAt() {
    return this.mylist.createdAt;
  }

  updatedAt() {
    return this.mylist.updatedAt;
  }
}
