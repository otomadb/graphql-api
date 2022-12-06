import { MylistRegistration } from "../db/entities/mylist_registrations.js";
import { MylistRegistrationResolvers } from "../graphql/resolvers.js";

export class MylistRegistrationModel implements MylistRegistrationResolvers {
  constructor(private readonly mylistRegistration: MylistRegistration) {}

  id() {
    return this.mylistRegistration.id;
  }
}
