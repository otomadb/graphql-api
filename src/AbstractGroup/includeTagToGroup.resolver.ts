import { GraphQLError } from "graphql";

import { parseGqlID3 } from "../resolvers/id.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";
import { AbstractGroupingDTO } from "./AbstractGrouping.dto.js";

export const mkIncludeTagToGroupResolver: MkMutationResolver<"includeTagToGroup", "prisma" | "logger"> =
  ({ prisma, logger }) =>
  async (_parent, { input }, { currentUser: { id: userId } }) => {
    const { groupKeyword, tagId: unparsedTagId } = input;
    const parsedTagId = parseGqlID3("Tag", unparsedTagId);
    if (isErr(parsedTagId)) {
      logger.error({ error: parsedTagId.error, input });
      throw new GraphQLError("Wrong form tag ID");
    }
    const tagId = parsedTagId.data;

    if (
      await prisma.abstractGrouping.findUnique({
        where: { groupKeyword_tagId: { groupKeyword, tagId }, disabled: false },
      })
    ) {
      logger.error({ input });
      throw new GraphQLError("Already included");
    }

    const grouping = await prisma.abstractGrouping.upsert({
      where: { groupKeyword_tagId: { groupKeyword, tagId } },
      update: {
        disabled: false,
        events: {
          create: { type: "REINCLUDE", userId },
        },
      },
      create: {
        groupKeyword,
        tagId,
        disabled: false,
        events: {
          create: { type: "INCLUDE", userId },
        },
      },
    });
    return {
      __typename: "IncludeTagToGroupSuccessfulPayload",
      grouping: AbstractGroupingDTO.fromPrisma(grouping),
    };
  };
