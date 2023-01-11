import { checkAuth } from "../../../auth/checkAuth.js";
import { UserRole } from "../../../db/entities/users.js";
import { QueryResolvers } from "../../../graphql.js";
import { UserModel } from "../../User/model.js";

export const whoami = () =>
  checkAuth(UserRole.NORMAL, (p, a, { user }) => {
    return new UserModel(user);
  }) satisfies QueryResolvers["whoami"];
