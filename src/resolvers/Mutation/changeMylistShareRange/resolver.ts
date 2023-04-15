import { isErr } from "../../../utils/Result.js";
import {
  ChangeMylistShareRangeOtherErrorMessage,
  ChangeMylistShareRangeOtherErrorsFallback,
  MutationMylistNotFoundError,
  MutationResolvers,
  MutationWrongMylistHolderError,
} from "../../graphql.js";
import { parseGqlID2 } from "../../id.js";
import { MylistModel } from "../../Mylist/model.js";
import { ResolverDeps } from "../../types.js";
import { update } from "./prisma.js";

export const resolverChangeMylistShareRange = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_parent, { input: { mylistId: mylistGqlId, range } }, { currentUser }, info) => {
    const mylistId = parseGqlID2("Mylist", mylistGqlId);
    if (isErr(mylistId)) {
      return {
        __typename: "MutationInvalidMylistIdError",
        mylistId: mylistGqlId,
      };
    }

    const result = await update(prisma, { mylistId: mylistId.data, userId: currentUser.id, range });
    if (isErr(result)) {
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
