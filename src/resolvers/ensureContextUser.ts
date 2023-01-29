import { UserRole } from "@prisma/client";
import { GraphQLError, GraphQLResolveInfo } from "graphql";

import { Context } from "./context.js";

export const ensureContextUser =
  <TResult, TParent, TArgs>(
    requestRole: UserRole,
    resolver: (
      parent: TParent,
      args: TArgs,
      ctx: Omit<Context, "user"> & { user: Exclude<Context["user"], null> },
      op: GraphQLResolveInfo
    ) => TResult
  ) =>
  (parent: TParent, args: TArgs, { user, ...rest }: Context, op: GraphQLResolveInfo) => {
    if (!user) throw new GraphQLError("you must be logged in");
    const { role } = user;

    if (
      (requestRole === UserRole.EDITOR && role !== UserRole.EDITOR && role !== UserRole.ADMINISTRATOR) || // Require EDITOR role
      (requestRole === UserRole.ADMINISTRATOR && role !== UserRole.ADMINISTRATOR) // Require ADMINISTRATOR role
    )
      throw new GraphQLError(`"${op.fieldName}" needs ${requestRole} role but your role is ${role}`);

    return resolver(parent, args, { user, ...rest }, op);
  };
