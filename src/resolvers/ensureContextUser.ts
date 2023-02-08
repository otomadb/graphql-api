import { UserRole } from "@prisma/client";
import { GraphQLError, GraphQLResolveInfo } from "graphql";

import { Context } from "./context.js";
import { ResolverDeps } from "./index.js";

export const ensureContextUser =
  <TResult, TParent, TArgs>(
    prisma: ResolverDeps["prisma"],
    requestRole: UserRole,
    resolver: (
      parent: TParent,
      args: TArgs,
      ctx: Omit<Context, "userId"> & { userId: Exclude<Context["userId"], null> },
      op: GraphQLResolveInfo
    ) => TResult
  ) =>
  async (parent: TParent, args: TArgs, { userId, ...rest }: Context, op: GraphQLResolveInfo) => {
    if (!userId) throw new GraphQLError("you must be logged in");

    const { id, role } = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    if (
      (requestRole === UserRole.EDITOR && role !== UserRole.EDITOR && role !== UserRole.ADMINISTRATOR) || // Require EDITOR role
      (requestRole === UserRole.ADMINISTRATOR && role !== UserRole.ADMINISTRATOR) // Require ADMINISTRATOR role
    )
      throw new GraphQLError(`"${op.fieldName}" needs ${requestRole} role but your role is ${role}`);

    return resolver(parent, args, { userId: id, ...rest }, op);
  };
