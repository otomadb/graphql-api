import { UserModel } from "../../graphql/models.js";
import { Resolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";

export const resolveId = ({ id }: UserModel) => addIDPrefix(ObjectType.User, id);

export const resolveUser: Resolvers["User"] = {
  id: resolveId,
};
