import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../types.js";
import { UserModel } from "../../User/model.js";

export const whoami = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, _args, { user: ctxUser }) => {
    if (!ctxUser) return null;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: ctxUser.id } });
    return new UserModel(user);
  }) satisfies QueryResolvers["whoami"];
