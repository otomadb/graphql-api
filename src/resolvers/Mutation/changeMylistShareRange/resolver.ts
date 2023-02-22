import {
  ChangeMylistShareRangeOtherErrorMessage,
  ChangeMylistShareRangeOtherErrorsFallback,
  MutationAuthenticationError,
  MutationMylistNotFoundError,
  MutationResolvers,
  MutationWrongMylistHolderError,
  UserRole as GraphQLUserRole,
} from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";
import { update } from "./prisma.js";

export const resolverChangeMylistShareRange = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { mylistId, range } }, { user: ctxUser }, info) => {
    if (!ctxUser)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } satisfies MutationAuthenticationError;

    const result = await update(prisma, { mylistId, userId: ctxUser.id, range });
    if (result.status === "error") {
      switch (result.error.message) {
        case "MYLIST_NOT_FOUND":
          return {
            __typename: "MutationMylistNotFoundError",
            mylistId: result.error.mylistId,
          } satisfies MutationMylistNotFoundError;
        case "MYLIST_WRONG_HOLDER":
          return {
            __typename: "MutationWrongMylistHolderError",
            mylistId: result.error.mylistId,
          } satisfies MutationWrongMylistHolderError;
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "ChangeMylistShareRangeOtherErrorsFallback",
            message: ChangeMylistShareRangeOtherErrorMessage.InternalServerError,
          } satisfies ChangeMylistShareRangeOtherErrorsFallback;
      }
    }

    const mylist = result.data;
    return {
      __typename: "ChangeMylistShareRangeSucceededPayload",
      mylist: new MylistModel(mylist),
    }; // TODO: satisfies
  }) satisfies MutationResolvers["changeMylistShareRange"];
