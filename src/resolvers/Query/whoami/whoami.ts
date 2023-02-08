import { QueryResolvers } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { UserModel } from "../../User/model.js";

export const whoami = ({ prisma }: Pick<ResolverDeps, "prisma">) =>
  (async (_parent, _args, { userId }) => {
    if (!userId) return null;

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return new UserModel(user);
  }) satisfies QueryResolvers["whoami"];
