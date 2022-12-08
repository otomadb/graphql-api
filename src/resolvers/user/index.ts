import { Resolvers } from "../../graphql/resolvers.js";
import { addIDPrefix, ObjectType } from "../../utils/id.js";

export const resolveUser = (): Resolvers["User"] => ({
  id: ({ id }) => addIDPrefix(ObjectType.User, id),
});
