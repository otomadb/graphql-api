import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MylistModel } from "../resolvers/Mylist/model.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkUpdateMylistSlugUpdate: MkMutationResolver<"updateMylistSlug", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (_, { input: { mylistId: mylistGqlId, newSlug } }, { currentUser: ctxUser }) => {
    const parsedMylistId = parseGqlID3("Mylist", mylistGqlId);
    if (isErr(parsedMylistId)) {
      logger.error({ error: parsedMylistId.error }, "Invalid Mylist ID");
      throw new GraphQLError("Invalid Mylist ID");
    }

    const mylist = await prisma.mylist
      .update({
        where: { id: parsedMylistId.data, holderId: ctxUser.id },
        data: { slug: newSlug },
      })
      .catch((e) => {
        logger.error({ error: e }, "Something wrong");
        throw new GraphQLError("Internal server error");
      });

    return {
      __typename: "UpdateMylistSlugSucceededPayload",
      mylist: new MylistModel(mylist),
    };
  };
